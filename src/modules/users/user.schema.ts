import { z } from "zod"

export const userSchema = z.object({
    email: z.string().max(20).endsWith("@gmail.com"),
    password: z.string().min(4).max(15),
    username: z.string().min(4).max(12).optional()
})

export type User = z.infer<typeof userSchema>