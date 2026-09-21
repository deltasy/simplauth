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
    access_token: z.string().openapi({description: "Access Token"}).openapi({example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}),
});



export const signRequestSchema = z.object({
    email: z.string().includes("@", {error: "E-mail inválido"})
    .endsWith(".com", {error: "E-mail inválido"})
    .openapi({example: "fulano@gmail.com"}),

    password: z.string({error: "Apenas texto é permitido"}
    ).min(4, "Senha muito curta").max(15, "Senha muito grande").openapi({example: "senha123"}),

    username: z.string({error: "Apenas texto é permitido"})
    .min(4, "Nickname muito curto").max(12, "Nickname muito grande").optional().openapi({example: "Usuario42"}),
});
export type signRequest = z.infer<typeof signRequestSchema>



export const signUpResponseSchema = z.object({
    id: z.string().openapi({description: "ID do usuário", example:"6c9af062-c6b7-48f8-b77a-813810ad3919"}),
    access_token: z.string().openapi({description: "Access Token", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."})
})

