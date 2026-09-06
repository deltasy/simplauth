import type { Request, Response, NextFunction } from "express"
import { z } from "zod"

export function validate(schema: z.ZodType){
    return async (req: Request, res: Response, next: NextFunction) => {

        const result = schema.safeParse(req.body);
        if(!result.success){
            return res.send(result.error!.issues);
        }
        return next();
    }
}