import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import type { HeadersObject } from "@asteasolutions/zod-to-openapi/dist/types.js";
import z from "zod"

extendZodWithOpenApi(z);


export const refreshTokenCookie = {
    "Set-Cookie": {
        description: "Refresh Token em cookie HTTP-only",
        schema: {type: "string"}
    }
} as HeadersObject;

export const tokenResponseSchema = z.object({
    access_token: z.string().openapi({description: "Access Token"})
});



export const signRequestSchema = z.object({
    email: z.string().min(4).includes("@").endsWith(".com").openapi({example: "admin@gmail.com"}),
    password: z.string().min(4).max(15).openapi({example: "12345"}),
})



export const signUpResponseSchema = z.object({
    id: z.string().openapi({description: "ID do usuário", example:"6c9af062-c6b7-48f8-b77a-813810ad3919"}),
    access_token: z.string().openapi({description: "Access Token"})
})

