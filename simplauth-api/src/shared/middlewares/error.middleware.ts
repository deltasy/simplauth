import type { NextFunction, Request, Response } from "express"
import { Prisma } from "@prisma/client";
import { ENV_TYPE } from "../../config/env.js";

import jwt from "jsonwebtoken"
import { ZodError } from "zod";

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            return res.status(409).json({ error: "Os dados fornecidos entram em conflito com um registro existente." });
        }

        if (error.code === "P2025") {
            return res.status(404).json({ error: "O recurso solicitado não foi encontrado ou não existe." });
        }
    }

    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: "Token inválido ou expirado" })
    }

    if(error instanceof ZodError) res.statusCode = 422;

    // Erros genéricos não-tratados

    const errorStatus = res.statusCode !== 200 ? res.statusCode : 500

    return res.status(errorStatus).json({
        error: error.cause,
        stack: ENV_TYPE === "production" ? "hidden" : error.stack
    });
}