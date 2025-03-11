import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import prisma from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  user_id: string;
  ws: WebSocket;
  rooms: string[];
}

interface Participant {
  user_id: string;
  ws: WebSocket;
}
type userObj = Record<string, User>;
type roomObj = Record<string, Participant[]>;

const users: userObj = {};
const rooms: roomObj = {};

const checkUser = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string") {
      return null;
    }
    if (!decoded || !decoded?.user_id) {
      return null;
    }
    return decoded?.user_id;
  } catch (error) {
    return null;
  }
};

wss.on("connection", function connection(ws, request) {
  try {
    const url = request.url;
    const params = new URLSearchParams(url?.split("?")[1]);
    const token = params.get("token") || "";

    const user_id = checkUser(token);
    if (!user_id) {
      ws.close();
      return;
    }
    if (!users[user_id])
      users[user_id] = {
        user_id,
        ws,
        rooms: [],
      };
    ws.on("message", async (data) => {
      try {
        let parsedData;
        if (typeof data !== "string") {
          parsedData = JSON.parse(data.toString());
        } else {
          parsedData = JSON.parse(data);
        }
        if (parsedData.type === "join_room") {
          
          const roomId = parsedData.roomId;
          const passKey = parsedData.passKey;
          const room = await prisma.room.findFirst({
            where: {
              id: roomId,
            },
            select: {
              id: true,
              passKey: true,
            },
          });
          if (!room) {
            console.log("no rooom");
            ws.close();
            return;
          }
          if (room.passKey !== passKey) {
            console.log("Invalid password");
            ws.close();
            return;
          }
          const users_in_room = rooms[roomId] || [];
          const user = users_in_room.findIndex((usr) => usr.user_id === user_id)
          if(user !== -1){
            // console.log("already in room");
            if (!users_in_room) return;
            if (users_in_room[user]) {
              users_in_room[user].ws = ws;
            }
            rooms[roomId] = users_in_room
            return;
          }
          users_in_room.push({ user_id, ws });
          rooms[roomId] = users_in_room;
          // console.log(rooms[roomId].length)
        } else if (parsedData.type === "chat") {
          const roomId = parsedData.roomId;
          // console.log("parsed data", parsedData)
          const message = parsedData.message;
          const shapeId = parsedData.shapeId;
          await prisma.chat.create({
            data: {
              roomId,
              message,
              userId: user_id,
              shapeId,
            },
          });
          // console.log(
          //   JSON.stringify({
          //     type: "chat",
          //     message: message,
          //   })
          // );
          rooms[roomId]?.forEach((user) => {
            if (user.user_id !== user_id) {
              user.ws.send(
                JSON.stringify({
                  type: "chat",
                  message: message,
                  shapeId: shapeId
                })
              );
              // console.log("sent to: ", user.user_id);
            }
          });
        } else if (parsedData.type === "leave_room") {
          // console.log(`${user_id} left room`);
          const roomId = parsedData.roomId;
          const new_state =
            rooms[roomId]?.filter((room) => room.user_id !== user_id) || [];
          rooms[roomId] = new_state;
        } else if (parsedData.type === "erase") {
          const roomId = parsedData.roomId;
          const shapeId = parsedData.shapeId as string;
          // console.log("parsed data: ", parsedData)
          // console.log("Shape Id to be deleted: ", shapeId)
          await prisma.chat.deleteMany({
            where: {
              shapeId: shapeId,
            },
          });
          // console.log(
          //   "erase data: ",
          //   JSON.stringify({
          //     type: "erase",
          //     shapeId: shapeId,
          //   })
          // );
          rooms[roomId]?.forEach((user) => {
            if (user.user_id !== user_id) {
              user.ws.send(
                JSON.stringify({
                  type: "erase",
                  shapeId: shapeId,
                })
              );
              // console.log("user id: ", user.user_id)
            }
          });
        }
      } catch (error) {
        ws.close();
        return;
      }
    });
    ws.on("close", () => {
      users[user_id]?.rooms.forEach((room_id: string) => {
        const new_state =
          rooms[room_id]?.filter((user) => user.user_id !== user_id) || [];
        rooms[room_id] = new_state;
      });
      delete users[user_id];
    });
  } catch (error) {
    console.log(error);
  }
});
