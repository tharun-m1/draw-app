import { NextFunction, Request, Response, Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn";
import prisma from "@repo/db/client"
import { CreateRoomBody } from "@repo/common/types";

export const roomRouter: Router = Router();

roomRouter.use(isLoggedIn)

roomRouter.post("/create", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const adminId = req.user_id;
        const parsedData = CreateRoomBody.safeParse(req.body)
        if (!parsedData.success) {
            res.status(400).json({
                message: "Validation Failed.",
            })
            return;
        }
        try {
            const room = await prisma.room.create({
                data: {
                    slug: parsedData?.data?.room,
                    adminId: adminId,
                }
            })
            res.status(200).json({
                message: "Room Created",
                roomId: room.id
            })
        } catch (error) {
            res.status(411).json({
                message: "Room Already Exists"
            })
        }


    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error."
        })
    }
})

roomRouter.delete("/delete/:roomId", async(req: Request, res: Response, next: NextFunction) => {
    try {
        const roomId = req.params.roomId;
        const room = await prisma.room.delete({
            where: {
                id: roomId
            }
        })
        res.status(200).json({
            roomId: room.id
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
})

roomRouter.get("/:slugId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const slugId = req.params.slugId
        const roomId = await prisma.room.findFirst({
            where: {
                slug: slugId
            },
            select: {
                id: true
            }
        })
        if (!roomId) {
            res.status(404).json({
                message: "Room not found"
            })
            return;
        }

        res.status(200).json({
            roomId: roomId.id
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
})


roomRouter.get("/chats/:roomId", async(req: Request, res:Response, next:NextFunction) => {
    try {
        const roomId = req.params.roomId;
        const messages = await prisma.chat.findMany({
            where:{
                roomId: roomId,
            }
        })
        res.status(200).json({
            messages
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
})


roomRouter.get("/all/rooms", async(req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user_id;
        const rooms = await prisma.room.findMany({
            where:{
                adminId:user_id 
            }
        })
        res.status(200).json({
            rooms
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
})