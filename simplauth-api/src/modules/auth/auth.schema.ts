import z from "zod"

import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import type { HeadersObject } from "@asteasolutions/zod-to-openapi/dist/types.js";

extendZodWithOpenApi(z);


export const refreshTokenCookie = {
    "Set-Cookie": {
        description: "Refresh Token in HTTP-only cookie",
        schema: {type: "string"}
    }
} as HeadersObject;

export const tokenResponseSchema = z.object({
    access_token: z.string().openapi({description: "Access Token"}).openapi({example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}),
});



export const signRequestSchema = z.object({
    email: z.string().includes("@", {error: "Invalid e-mail"})
    .endsWith(".com", {error: "Invalid e-mail"})
    .openapi({example: "fulano@gmail.com"}),

    password: z.string({error: "Only text is allowed"}
    ).min(4, "Password too short").max(15, "Password too long").openapi({example: "senha123"}),

    username: z.string({error: "Only text is allowed"})
    .min(4, "Nickname too short").max(12, "Nickname too long").optional().openapi({example: "Usuario42"}),
});
export type signRequest = z.infer<typeof signRequestSchema>



export const signUpResponseSchema = z.object({
    id: z.string().openapi({description: "User ID", example:"6c9af062-c6b7-48f8-b77a-813810ad3919"}),
    access_token: z.string().openapi({description: "Access Token", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."})
})

