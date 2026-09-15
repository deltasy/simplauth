import z from "zod";
import { registry } from "../../../config/openapi.js";
import { refreshTokenCookie } from "../../auth/auth.schema.js";
import { routesMetadataV1 } from "../../../shared/routes/v1.metadata.js";

export default function registerDebugDocs() {
    const { setCookieRoute } = routesMetadataV1;

    // SET COOKIE
    registry.registerPath({
        method: "post",
        path: setCookieRoute.relative_with_prefix,
        summary: "Setar refresh cookie",
        tags: ["Debug (ADMIN)"],
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
}