import { NextFunction, Request, Response, Router } from "express";
import prisma from "@repo/db/client"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { LoginBody, SignupBody } from "@repo/common/types";
import { JWT_SECRET } from "@repo/backend-common/config";


export const authRouter: Router = Router();

authRouter.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedData = SignupBody.safeParse(req.body);
        const data = parsedData.data
        if (data?.password !== data?.confirmPassword) {
            res.status(400).json({
                message: "Passwords do not match"
            })
            return;
        }
        if (!parsedData.success) {
            res.status(400).json({
                message: "Validation Failed."
            })
            return;
        }
        const user = await prisma.user.findFirst({
            where: {
                email: parsedData.data?.email
            }
        })
        if (user) {
            res.status(400).json({
                message: "Account already Exist"
            })
            return
        }
        const hashedPassword = await bcrypt.hash(parsedData.data.password, 10)
        await prisma.user.create({
            data: {
                email: parsedData.data.email,
                password: hashedPassword,
                name:"Guest"
            }
        })
        res.status(200).json({
            message: "Success"
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error."
        })
    }
})

authRouter.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedData = LoginBody.safeParse(req.body)
        if (!parsedData.success) {
            res.status(400).json({
                message: "Validation Failed"
            })
            return;
        }
        const user = await prisma.user.findFirst({
            where: {
                email: parsedData.data.email
            }
        })
        if (!user) {
            res.status(400).json({
                message: "User doesn't Exist."
            })
            return;
        }
        const passwordMatched = await bcrypt.compare(parsedData.data.password, user.password)
        if (!passwordMatched) {
            res.status(401).json({
                message: "Incorrect Password"
            })
            return;
        }
        const payload = {
            user_id: user.id,
        }
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: 60 * 60 * 24 })
        res.status(200).json({
            token: token
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error."
        })
    }
})

