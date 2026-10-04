import { registry } from "#config/openapi.js";
import { z } from "zod";

import { routesMetadataV1 } from "@simplauth/shared";

import { signUpResponseSchema } from "#auth/auth.schema.js";
import { deletionConfirmSchema, editProfileSchema, selfProfileSchema } from "../user.schema.js";



export default function registerUserDocs() {
    const { myUserRoute, userProfileRoute, userEditRoute, checkAttRoute, userDeleteRoute } = routesMetadataV1;

    const userDeletionRequest = registry.register("userDeletionRequest", deletionConfirmSchema);
    const editUserRequest = registry.register("editUserRequest", editProfileSchema);
    const myUserResponse = registry.register("MyUserResponse", selfProfileSchema);

    // PUBLIC PROFILE
    registry.registerPath({
        method: "get",
        path: userProfileRoute.relative_with_prefix + "{profile_name}",
        summary: "Public profile",
        tags: ["Users"],
        request: {
            params: z.object({
                profile_name: z.string().openapi({
                    description: "The target username for the search",
                    example: "member"
                })
            })
        },
        responses: {
            200: {
                description: "Existing profile",
                content: {
                    "application/json": {
                        schema: signUpResponseSchema,
                    },
                },
            },
            404: {
                description: "Non-existent profile"
            }
        },
    });

    // CURRENT USER
    registry.registerPath({
        method: "get",
        path: myUserRoute.relative_with_prefix,
        summary: "Current user",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Data obtained",
                content: {
                    "application/json": {
                        schema: myUserResponse,
                    },
                },
            },
            401: {
                description: "Invalid Access Token"
            }
        },
    });

    // EDIT USER
    registry.registerPath({
        method: "put",
        path: userEditRoute.relative_with_prefix,
        summary: "Edit account",
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
                description: "Fields changed successfully"
            },
            401: {
                description: "Invalid or expired token"
            },
            422: {
                description: "Badly formatted or invalid fields"
            }
        },
    });

    // DELETE USER
    registry.registerPath({
        method: "delete",
        path: userDeleteRoute.relative_with_prefix,
        summary: "Delete account",
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
                description: "User deleted successfully"
            },
            401: {
                description: "Invalid or expired token"
            },
            422: {
                description: "Invalid confirmation"
            }
        },
    });

    // CHECK EDIT
    registry.registerPath({
        method: "get",
        path: checkAttRoute.relative_with_prefix,
        summary: "Check attribute",
        tags: ["Utils"],
        security: [{ cookieAuth: [] }],
        request: {
            query: editProfileSchema
        },
        responses: {
            200: {
                description: "Available"
            },
            409: {
                description: "Unavailable (Already exists)"
            }
        },
    });
}