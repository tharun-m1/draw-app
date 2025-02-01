import {z} from "zod"

export const SignupBody = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6)
    
})

export const LoginBody = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const CreateRoomBody = z.object({
    room: z.string().min(3).nonempty().refine((s) => !s.includes(" "), 'No Spaces')
})