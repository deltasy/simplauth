import { registry } from "../../../config/openapi.js";
import { refreshTokenCookie, signRequestSchema, signUpResponseSchema, tokenResponseSchema } from "../auth.schema.js";

import { routesMetadataV1 } from "../../../../../shared/src/routes/v1.metadata.js";


export default function registerAuthDocs() {
    const { signUpRoute, signInRoute, logoutRoute, refreshRoute } = routesMetadataV1;


    const signInRequest = registry.register("SignInRequest", signRequestSchema);
    const signUpRequest = registry.register("SignUpRequest", signRequestSchema);

    const signInResponse = registry.register("SignInResponse", tokenResponseSchema);
    const signUpResponse = registry.register("SignUpResponse", signUpResponseSchema);

    // --------------------------------------------------------------------------


    //// DOCUMENTAÇÃO

    // REGISTRO
    registry.registerPath({
        method: "post",
        path: signUpRoute.relative_with_prefix,
        summary: "Registro",
        tags: ["Auth"],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: signUpRequest,
                    },
                },
            },
        },
        responses: {
            201: {
                description: "Usuário registrado",
                headers: refreshTokenCookie,
                content: {
                    "application/json": {
                        schema: signUpResponse,
                    },
                },
            },
            401: {
                description: "Credenciais inválidas",
            },
            409: {
                description: "Registro duplicado"
            },
            422: {
                description: "Campos mal formatados"
            }
        },
    });

    // LOGIN
    registry.registerPath({
        method: "post",
        path: signInRoute.relative_with_prefix,
        summary: "Login",
        tags: ["Auth"],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: signInRequest,
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Autenticação confirmada",
                headers: refreshTokenCookie,
                content: {
                    "application/json": {
                        schema: signInResponse,
                    },
                },
            },
            401: {
                description: "Credenciais inválidas",
            },
        },
    });

    // Logout
    registry.registerPath({
        method: "post",
        path: logoutRoute.relative_with_prefix,
        summary: "Logout",
        tags: ["Auth"],
        request: {},
        responses: {
            200: {
                description: "Deslogado com sucesso"
            }
        },
    });

    // REFRESH
    registry.registerPath({
        method: "get",
        path: refreshRoute.relative_with_prefix,
        summary: "Renovação de token",
        tags: ["Auth"],
        security: [{ cookieAuth: [] }],
        responses: {
            200: {
                description: "Refresh Token + Access Token renovados",
                headers: refreshTokenCookie,
                content: {
                    "application/json": {
                        schema: tokenResponseSchema,
                    },
                },
            },
            403: {
                description: "Credenciais atuais inválidas para renovação"
            }
        },
    });
}