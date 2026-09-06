import type { NextFunction, Request, Response } from "express"
import { Prisma } from "@prisma/client";

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if(error instanceof Prisma.PrismaClientKnownRequestError){
        if(error.code === "P2002"){
            return res.status(409).json({error: "Este registro já está em uso."})
        }
        if(error.code === "P2025"){
            return res.status(404).json({error: "Registro não encontrado."})
        }
    }

    console.error("[ERRO CRÍTICO]", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
}