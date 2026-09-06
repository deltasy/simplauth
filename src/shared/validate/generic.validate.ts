import type { Request, Response, NextFunction } from "express"
import { z } from "zod"

export function validate(schema: z.ZodType){
    return async (req: Request, res: Response, next: NextFunction) => {
        const result = await schema.safeParseAsync(req.body);
        if(!result.success){
            return res.status(400).json(result.error.issues);
        }
        return next();
    }
}