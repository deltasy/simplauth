import z from "zod";
import { DATABASE_URL, PORT, JWT_SECRET, JWT_EXPIRES_IN } from "../../config/env.js";
import type { Request, Response, NextFunction } from "express";

const envReady = z.object({
    PORT: z.string(), DATABASE_URL: z.string(), JWT_SECRET: z.string(), JWT_EXPIRES_IN: z.string()
})

export const assertEnvironment = () => {
    try{
        envReady.parse({
            DATABASE_URL: DATABASE_URL, PORT: PORT, JWT_SECRET: JWT_SECRET, JWT_EXPIRES_IN: JWT_EXPIRES_IN
        });

    }catch(error){
        console.error(error);
        process.exit(1);
    }
}