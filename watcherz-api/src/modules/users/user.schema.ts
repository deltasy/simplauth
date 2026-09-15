import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Permission } from "@prisma/client";
import { z } from "zod"

extendZodWithOpenApi(z);

export const userSchema = z.object({
    email: z.string().includes("@").endsWith(".com"),
    password: z.string().min(4).max(15),
    username: z.string().min(4).max(12).optional()
})

export const selfProfileSchema = z.object({
    createdAt: z.string().openapi({example: "2026-09-12T18:13:15.026Z"}),
    email: z.string().openapi({example: "fulano@gmail.com"}),
    username: z.string().nullish().openapi({example: "usuario42"}),
    permission: z.enum(Permission).openapi({example: "ADMIN"})
})

export const editProfileSchema = selfProfileSchema.omit({
    createdAt: true,
    permission: true
}).partial().strict();

export type User = z.infer<typeof userSchema>