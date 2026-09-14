import type { Request, Response, NextFunction } from "express"
import type { JwtPayload } from "jsonwebtoken"

import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../../../../config/env.js";

// Equivalente ao "auth", mas é exclusivo para refresh tokens
export const assertRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!(req.cookies && req.cookies.refreshToken)) {
            return res.status(401).json({ error: "Token inválido ou expirado" })
        }

        const token = req.cookies.refreshToken as string;
        const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload

        req.userId = decoded.userId
        next()

    } catch (error) {
        next(error)
    }
}