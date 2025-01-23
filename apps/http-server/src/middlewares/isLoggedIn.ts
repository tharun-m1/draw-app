import { NextFunction, Request, Response } from "express"
import { JWT_SECRET } from "@repo/backend-common/config"
import jwt from "jsonwebtoken"

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    try {

        const token = req.headers.authorization
        if (!token) {
            res.status(401).json({
                message: "Unauthorized"
            })
            return;
        }
        const decoded = jwt.verify(token, JWT_SECRET)
        if (typeof decoded === "string") {
            res.status(400).json({
                message: "Unauthorized"
            })
            return;
        }
        if (decoded.user_id) {
            req.user_id = decoded.user_id
        }
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error."
        })
    }
}