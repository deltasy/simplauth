import express from "express"
import { PORT } from "./config/env.js";
import { userRouter } from "./modules/users/user.routes.js";
import { errorHandler } from "./shared/middleware/error.middleware.js";
import { assertEnvironment } from "./shared/validate/environment.validate.js";

import type { Request, Response } from "express"

import cors from "cors"
import cookieParser from 'cookie-parser';
import { debugRouter } from "./modules/debug/debug.routes.js";
import type { Permission } from "@prisma/client";

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
app.use(cookieParser())
app.use('/user', userRouter);
app.use('/debug', debugRouter);

app.get("/", (req: Request, res: Response) => {
    return res.json({message: "OK"})
})

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Iniciado na porta ${PORT}!`)
})

export default app;