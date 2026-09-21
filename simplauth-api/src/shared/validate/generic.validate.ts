import type { Request, Response, NextFunction } from "express"
import { z } from "zod"

export function validate(schema: z.ZodType){
    return async (req: Request, res: Response, next: NextFunction) => {
        const result = await schema.safeParseAsync(req.body);
        if(!result.success){
            return res.status(422).json(result.error.issues);
        }

        // req.body é sobrescrito para garantir a sanitização feita pelo ZOD
        req.body = result.data;
        return next();
    }
}