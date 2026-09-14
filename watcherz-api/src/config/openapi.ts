import { z } from "zod";
import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { PORT } from "./env.js";


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
    const generator = new OpenApiGeneratorV3(registry.definitions);

    return generator.generateDocument({
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "WatcherZ API",
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
