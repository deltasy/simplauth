import express from "express"
import { PORT } from "./config/env.js";

import { routerV1, routesMetadata } from "./shared/routes/v1.js";

import { errorHandler } from "./shared/middleware/error.middleware.js";
import { assertEnvironment } from "./shared/validate/environment.validate.js";

import type { Request, Response } from "express"

import cors from "cors"
import cookieParser from 'cookie-parser';

import { apiReference } from "@scalar/express-api-reference";
import { scalarConfig } from "../scalar.config.js";

import type { Permission } from "@prisma/client";
import { generateOpenApiDocument } from "./config/openapi.js";


declare global {
    namespace Express {
        interface Request {
            userId?: string;
            permission?: Permission;
        }
    }
}

export const app = express();

assertEnvironment();

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    optionsSuccessStatus: 200
}))

app.use(express.json());
app.use(cookieParser());


// Versionamento de API
export const routeData = routesMetadata;
app.use(routerV1);

app.use(`${routeData.baseUrl}/docs`,
    apiReference({
        ...scalarConfig,
        spec: {
            content: generateOpenApiDocument(routeData.baseUrl),
        }
    })
);


app.get("/", (req: Request, res: Response) => {
    return res.json({ message: "OK" })
})

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Iniciado na porta ${PORT}!`)
})

export default app;