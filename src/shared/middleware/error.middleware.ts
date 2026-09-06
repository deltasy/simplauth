import type { NextFunction, Request, Response } from "express"
import { Prisma } from "@prisma/client";

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if(error instanceof Prisma.PrismaClientKnownRequestError){
        if(error.code === "P2002" || error.code === "P2025"){
            return res.status(403).json({error: "E-mail inválido"})
        }
    }

    console.log(typeof error);
    return res.status(500).send(error);
}
