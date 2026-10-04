import { z } from "zod"
import type { Request, Response, NextFunction } from "express"

export function validate(schema: z.ZodType){
    return async (req: Request, res: Response, next: NextFunction) => {
        const result = await schema.safeParseAsync(req.body);
        if(!result.success){
            return res.status(422).json(result.error.issues);
        }

        // req.body is overwritten to ensure sanitization by ZOD
        req.body = result.data;
        return next();
    }
}