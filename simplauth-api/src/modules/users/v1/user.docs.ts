import { registry } from "../../../config/openapi.js";
import { z } from "zod";

import { signUpResponseSchema } from "../../auth/auth.schema.js";

import { routesMetadataV1 } from "../../../../../shared/src/routes/v1.metadata.js";

import { deletionConfirmSchema, editProfileSchema, selfProfileSchema } from "../user.schema.js";

export default function registerUserDocs() {
    const { myUserRoute, userProfileRoute, userEditRoute, checkAttRoute, userDeleteRoute } = routesMetadataV1;

    const userDeletionRequest = registry.register("userDeletionRequest", deletionConfirmSchema);

    const editUserRequest = registry.register("editUserRequest", editProfileSchema);
    const checkAttRequest = registry.register("checkUserAttributeRequest", editProfileSchema);

    const myUserResponse = registry.register("MyUserResponse", selfProfileSchema);

    // PERFIL PÚBLICO
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

    // USUÁRIO ATUAL
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

    // ALTERAR USUÁRIO
    registry.registerPath({
        method: "put",
        path: userEditRoute.relative_with_prefix,
        summary: "Editar conta",
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

    // DELETAR USUÁRIO
    registry.registerPath({
        method: "delete",
        path: userDeleteRoute.relative_with_prefix,
        summary: "Deletar conta",
        tags: ["Users"],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: userDeletionRequest,
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Usuário deletado com sucesso"
            },
            401: {
                description: "Token inválido ou expirado"
            },
            422: {
                description: "Confirmação inválida"
            }
        },
    });

    // CHECK EDIT
    registry.registerPath({
        method: "get",
        path: checkAttRoute.relative_with_prefix,
        summary: "Checar atributo",
        tags: ["Utils"],
        security: [{ cookieAuth: [] }],
        request: {
            query: editProfileSchema
        },
        responses: {
            200: {
                description: "Disponível"
            },
            409: {
                description: "Indisponível (Já existe)"
            }
        },
    });
}