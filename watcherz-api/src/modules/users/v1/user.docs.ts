import { registry } from "../../../config/openapi.js";
import { z } from "zod";

// SCHEMAS
const signInSchema = registry.register(
    "SignInRequest",
    z.object({
        email: z.string().includes("@").endsWith(".com").openapi({example: "fulano@gmail.com"}),
        password: z.string().min(4).max(15).openapi({example: "senha12345"}),
    })
)
const SignInResponseSchema = registry.register(
    "SignInResponse",
    z.object({
        token: z.string().openapi({description: "JWT Token"})
    })
)

const signUpSchema = signInSchema;
const signUpResponseSchema = registry.register(
    "SignUpResponse",
    z.object({
        id: z.string().openapi({example: "6c9af062-b6b7-48f8-b77a-8acd10163b29", description: "Id do usuário"}),
        accessToken: z.string().openapi({description: "JWT Access Token"}),

    })
)



//// DOCUMENTAÇÃO

// LOGIN
registry.registerPath({
    method: "post",
    path: "/users/sign-in",
    summary: "Login",
    tags: ["Users"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: signInSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Autenticação confirmada. Retorna o access token e seta o refresh token num cookie",
            content: {
                "application/json": {
                    schema: SignInResponseSchema,
                },
            },
        },
        401: {
            description: "Credenciais inválidas",
        },
    },
});

// REGISTRO
