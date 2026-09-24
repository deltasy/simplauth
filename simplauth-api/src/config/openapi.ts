import { z } from "zod";
import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { PORT } from "./env.js";

import registerUserDocs from "../modules/users/v1/user.docs.js";
import registerAuthDocs from "../modules/auth/v1/auth.docs.js";
import registerAdminDocs from "../modules/admin/v1/admin.docs.js";

extendZodWithOpenApi(z);
export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});
registry.registerComponent("securitySchemes", "cookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "refreshToken",
});

export function generateOpenApiDocument(baseUrl: string) {
    registerUserDocs();
    registerAuthDocs();
    registerAdminDocs();

    const generator = new OpenApiGeneratorV3(registry.definitions);

    return generator.generateDocument({
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "Simplauth API",
            description: "Documentação automatizada a partir de contratos Zod.",
        },
        servers: [
            {
                url: `http://localhost:${PORT}${baseUrl}`,
                description: "Servidor local (V1)",
            },
        ],
    });
}
