import { routesMetadataV1 } from "@simplauth/shared";

import { registry } from "#config/openapi.js";

import { refreshTokenCookie, signRequestSchema, signUpResponseSchema, tokenResponseSchema } from "../auth.schema.js";


export default function registerAuthDocs() {
    const { signUpRoute, signInRoute, logoutRoute, refreshRoute } = routesMetadataV1;


    const signInRequest = registry.register("SignInRequest", signRequestSchema);
    const signUpRequest = registry.register("SignUpRequest", signRequestSchema);

    const signInResponse = registry.register("SignInResponse", tokenResponseSchema);
    const signUpResponse = registry.register("SignUpResponse", signUpResponseSchema);

    // --------------------------------------------------------------------------


    //// DOCUMENTATION

    // REGISTER
    registry.registerPath({
        method: "post",
        path: signUpRoute.relative_with_prefix,
        summary: "Register",
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
                description: "User registered",
                headers: refreshTokenCookie,
                content: {
                    "application/json": {
                        schema: signUpResponse,
                    },
                },
            },
            401: {
                description: "Invalid credentials",
            },
            409: {
                description: "Duplicate registration"
            },
            422: {
                description: "Badly formatted fields"
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
                description: "Authentication confirmed",
                headers: refreshTokenCookie,
                content: {
                    "application/json": {
                        schema: signInResponse,
                    },
                },
            },
            401: {
                description: "Invalid credentials",
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
                description: "Logged out successfully"
            }
        },
    });

    // REFRESH
    registry.registerPath({
        method: "get",
        path: refreshRoute.relative_with_prefix,
        summary: "Token renewal",
        tags: ["Auth"],
        security: [{ cookieAuth: [] }],
        responses: {
            200: {
                description: "Refresh Token + Access Token renewed",
                headers: refreshTokenCookie,
                content: {
                    "application/json": {
                        schema: tokenResponseSchema,
                    },
                },
            },
            403: {
                description: "Current credentials invalid for renewal"
            }
        },
    });
}