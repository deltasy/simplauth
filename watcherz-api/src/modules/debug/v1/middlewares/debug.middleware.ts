import { Permission } from "@prisma/client"
import type { Request, Response, NextFunction } from "express"

export function checkPermission(requiredPermission: Permission){
    return async (req: Request, res: Response, next: NextFunction) => {
        try{
            if(req.permission != requiredPermission) return res.status(403).json({error: "Permissões insuficientes"})

            next()

        }catch(error){
            next(error)
        }
    }
}