import type { Request, Response, NextFunction } from "express"

import { Permission } from "@prisma/client"

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