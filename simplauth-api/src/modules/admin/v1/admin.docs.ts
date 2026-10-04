import z from "zod";


import { routesMetadataV1 } from "@simplauth/shared";

import { registry } from "#config/openapi.js";
import { refreshTokenCookie } from "#auth/auth.schema.js";

import { restoreUserSchema } from "../admin.schema.js";

export default function registerAdminDocs() {
    const { setCookieRoute, userRestoreRoute } = routesMetadataV1;

    const restoreUserRequest = registry.register("RestoreUserRequest", restoreUserSchema);

    // SET COOKIE
    registry.registerPath({
        method: "post",
        path: setCookieRoute.relative_with_prefix,
        summary: "Set refresh cookie",
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
                description: "Refresh cookie set",
            },
            401: {
                description: "Invalid or expired token",
            },
            403: {
                description: "Insufficient permissions"
            }
        },
    });

    // Restore deleted user
    registry.registerPath({
        method: "post",
        path: userRestoreRoute.relative_with_prefix,
        summary: "Restore user",
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
                description: "User restored (DELETE reverted)"
            },
            403: {
                description: "Insufficient permissions"
            },
            404: {
                description: "Deleted user non-existent"
            }
        },
    });

}