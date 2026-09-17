import z from "zod";
import { registry } from "../../../config/openapi.js";
import { refreshTokenCookie } from "../../auth/auth.schema.js";

import { routesMetadataV1 } from "../../../../../shared/src/routes/v1.metadata.js";

import { restoreUserSchema } from "../admin.schema.js";

export default function registerAdminDocs() {
    const { setCookieRoute, userRestoreRoute } = routesMetadataV1;

    const restoreUserRequest = registry.register("RestoreUserRequest", restoreUserSchema);

    // SET COOKIE
    registry.registerPath({
        method: "post",
        path: setCookieRoute.relative_with_prefix,
        summary: "Setar refresh cookie",
        tags: ["ADMIN"],
        security: [{ bearerAuth: [], cookieAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            cookie: z.string().openapi({ example: "cookie123" })
                        })
                    },
                },
            },
        },
        responses: {
            200: {
                headers: refreshTokenCookie,
                description: "Refresh cookie setado",
            },
            401: {
                description: "Token inválido ou expirado",
            },
            403: {
                description: "Permissões insuficientes"
            }
        },
    });

    // Restaurar usuário deletado
    registry.registerPath({
        method: "post",
        path: userRestoreRoute.relative_with_prefix,
        summary: "Restaurar usuário",
        tags: ["ADMIN"],
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: restoreUserRequest
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Usuário restaurado (DELETE revertido)"
            },
            403: {
                description: "Permissões insuficientes"
            },
            404: {
                description: "Usuário deletado inexistente"
            }
        },
    });

}