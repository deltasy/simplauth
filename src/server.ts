import express from "express"
import { PORT } from "./config/env.js";
import { userRouter } from "./modules/users/user.routes.js";
import { errorHandler } from "./shared/middleware/error.middleware.js";
import { assertEnvironment } from "./shared/validate/environment.validate.js";

import cookieParser from 'cookie-parser';
import { debugRouter } from "./modules/debug/debug.router.js";
import type { Permission } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            permission?: Permission;
        }
    }
}

const app = express();

assertEnvironment();

app.use(express.json());
app.use(cookieParser())
app.use('/user', userRouter);
app.use('/debug', debugRouter);

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Iniciado na porta ${PORT}!`)
})

let teste: string = "a"
teste = 2