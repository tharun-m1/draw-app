import { WebSocket, WebSocketServer } from 'ws';
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"

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
        users[user_id] = {
            user_id,
            ws,
            rooms: []
        }
        ws.on("message", (data) => {
            const parsedData = JSON.parse(data as unknown as string)
            if (parsedData.type === "join_room") {
                const roomId = parsedData.roomId
                users[user_id]?.rooms.push(roomId)
                const oldRoomData = rooms[roomId] || []
                rooms[roomId] = [...oldRoomData, { user_id, ws }]
            }
            console.log("users: ", Object.keys(users))
            console.log("rooms: ", rooms)
            if (parsedData.type === "leave_room") {
                const roomId = parsedData.roomId;
                const filtered = rooms[roomId]?.filter((p) => p.user_id !== user_id) || []
                rooms[roomId] = filtered
                const filterdRooms = users[user_id]?.rooms.filter((room) => room !== roomId) || []
                if (!users[user_id]) {
                    ws.close();
                    return;
                }
                users[user_id].rooms = filterdRooms
                console.log("users: ", Object.keys(users))
                console.log("rooms: ", rooms)
            }
        })
    } catch (error) {
        console.log(error)
    }

});