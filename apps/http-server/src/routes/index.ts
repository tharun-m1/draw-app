import { Router } from "express";
import { authRouter } from "./auth";
import { roomRouter } from "./room";


const rootRouter:Router = Router()

rootRouter.use("/auth", authRouter)
rootRouter.use("/room", roomRouter)



export default rootRouter