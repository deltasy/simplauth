import { registry } from "../../../config/openapi.js";
import { z } from "zod";

import { signUpResponseSchema } from "../../auth/auth.schema.js";
import { routesMetadataV1 } from "../../../shared/routes/v1.metadata.js";
import { editProfileSchema, selfProfileSchema } from "../user.schema.js";

export default function registerUserDocs() {
    const { myUserRoute, userProfileRoute, userEditRoute } = routesMetadataV1;

    const editUserRequest = registry.register("editUserRequest", editProfileSchema);

    const myUserResponse = registry.register("MyUserResponse", selfProfileSchema);

    // Usuário atual
    registry.registerPath({
        method: "get",
        path: myUserRoute.relative_with_prefix,
        summary: "Usuário atual",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Dados obtidos",
                content: {
                    "application/json": {
                        schema: myUserResponse,
                    },
                },
            },
            401: {
                description: "Access Token inválido"
            }
        },
    });

    // ALTERAR CAMPOS
    registry.registerPath({
        method: "put",
        path: userEditRoute.relative_with_prefix,
        summary: "Editar perfil",
        tags: ["Users"],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: editUserRequest,
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Campos alterados com sucesso"
            },
            401: {
                description: "Token inválido ou expirado"
            },
            422: {
                description: "Campos mal-formatados ou inválidos"
            }
        },
    });

    // Perfis públicos
    registry.registerPath({
        method: "get",
        path: userProfileRoute.relative_with_prefix + "{profile_name}",
        summary: "Perfil público",
        tags: ["Users"],
        request: {
            params: z.object({
                profile_name: z.string().openapi({
                    description: "O nome de usuário (username) alvo da busca",
                    example: "member"
                })
            })
        },
        responses: {
            200: {
                description: "Perfil existente",
                content: {
                    "application/json": {
                        schema: signUpResponseSchema,
                    },
                },
            },
            404: {
                description: "Perfil inexistente"
            }
        },
    });
}