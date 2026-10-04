import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { ZodError } from "zod";

import { Prisma } from "@prisma/client";

import { ENV_TYPE } from "#config/env.js";


export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            return res.status(409).json({ error: "The provided data conflicts with an existing record." });
        }

        if (error.code === "P2025") {
            return res.status(404).json({ error: "The requested resource was not found or does not exist." });
        }
    }

    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: "Invalid or expired token" })
    }

    if(error instanceof ZodError) res.statusCode = 422;

    // Unhandled generic errors

    const errorStatus = res.statusCode !== 200 ? res.statusCode : 500

    return res.status(errorStatus).json({
        error: error.cause,
        stack: ENV_TYPE === "production" ? "hidden" : error.stack
    });
}