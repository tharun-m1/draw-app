import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn";
import prisma from "@repo/db/client"
import { CreateRoomBody } from "@repo/common/types";

export const roomRouter: Router = Router();

roomRouter.use(isLoggedIn)

roomRouter.post("/create", async (req, res, next) => {
    try {
        const adminId = req.user_id;
        const parsedData = CreateRoomBody.safeParse(req.body)
        if (!parsedData.success) {
            res.status(400).json({
                message: "Validation Failed."
            })
            return;
        }
        try {
            const room = await prisma.room.create({
                data: {
                    slug: parsedData?.data?.slug,
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