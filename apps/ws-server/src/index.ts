import { WebSocket, WebSocketServer } from 'ws';
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import prisma from "@repo/db/client"

const wss = new WebSocketServer({ port: 8080 });

interface User {
    user_id: string,
    ws: WebSocket,
    rooms: string[]
}

interface Participant {
    user_id: string,
    ws: WebSocket
}
type userObj = Record<string, User>
type roomObj = Record<string, Participant[]>

const users: userObj = {}
const rooms: roomObj = {}


const checkUser = (token: string): string | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        if (typeof decoded === "string") {
            return null
        }
        if (!decoded || !decoded?.user_id) {
            return null
        }
        return decoded?.user_id
    } catch (error) {
        return null
    }

}

wss.on('connection', function connection(ws, request) {

    try {
        const url = request.url
        const params = new URLSearchParams(url?.split("?")[1])
        const token = params.get("token") || "";

        const user_id = checkUser(token)
        if (!user_id) {
            ws.close()
            return;
        }
        if (!users[user_id])
            users[user_id] = {
                user_id,
                ws,
                rooms: []
            }
        ws.on("message", async (data) => {
            try {

                let parsedData;
                if (typeof data !== "string") {
                    parsedData = JSON.parse(data.toString());
                } else {
                    parsedData = JSON.parse(data);
                }
                console.log(parsedData)
                console.log("type of data", typeof parsedData)
                if (parsedData.type === "join_room") {
                    const roomId = parsedData.roomId;
                    console.log("roomID; ", roomId)
                    const room = await prisma.room.findFirst({
                        where: {
                            id: roomId
                        },
                        select: {
                            id: true
                        }
                    })
                    if (!room) {
                        console.log("no rooom")
                        ws.close();
                        return;
                    }
                    const users_in_room = rooms[roomId] || []
                    users_in_room.push({ user_id, ws })
                    rooms[roomId] = users_in_room;
                } else if (parsedData.type === "chat") {

                    const roomId = parsedData.roomId
                    const message = parsedData.message;

                    await prisma.chat.create({
                        data: {
                            roomId,
                            message,
                            userId: user_id
                        }
                    })
                    rooms[roomId]?.forEach((room) => {
                        room.ws.send(JSON.stringify({
                            type: "chat",
                            message: message
                        }))
                    })
                } else if (parsedData.type === "leave_room") {
                    const roomId = parsedData.roomId;
                    const new_state = rooms[roomId]?.filter((room) => room.user_id !== user_id) || []
                    rooms[roomId] = new_state
                }
            } catch (error) {
                ws.close()
                return;
            }

        })
        ws.on("close", () => {
            users[user_id]?.rooms.forEach((room_id: string) => {
                const new_state = rooms[room_id]?.filter((user) => user.user_id !== user_id) || []
                rooms[room_id] = new_state
            })
            delete users[user_id]
        })
    } catch (error) {
        console.log(error)
    }

});