import { z } from "zod"
import { registry } from "../../config/openapi.js"

export const userSchema = z.object({
    email: z.string().includes("@").endsWith(".com"),
    password: z.string().min(4).max(15),
    username: z.string().min(4).max(12).optional()
})

export type User = z.infer<typeof userSchema>