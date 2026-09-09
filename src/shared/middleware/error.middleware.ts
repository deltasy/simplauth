import type { NextFunction, Request, Response } from "express"
import { Prisma } from "@prisma/client";

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    // Erros neutros que não entregam informações desnecessárias para usuários mal intencionados
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            return res.status(409).json({ error: "Os dados fornecidos entram em conflito com um registro existente." });
        }

        if (error.code === "P2025") {
            return res.status(404).json({ error: "O recurso solicitado não foi encontrado ou não existe." });
        }
    }

    // Não é uma boa prática deixar hardcodado dessa forma, mas vai ser assim por enquanto
    if(typeof error == "string"){
        if(error === "Esse token já foi utilizado"){
            res.status(403);
        }

        return res.json({error: error})
    }

    console.error("[ERRO INTERNO]:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
}