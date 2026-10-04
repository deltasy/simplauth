import type { Request, Response, NextFunction } from "express"
import type { JwtPayload } from "jsonwebtoken"

import jwt from "jsonwebtoken"
import { JWT_SECRET } from "#config/env.js";

// Equivalent to "auth", but exclusive to refresh tokens
export const assertRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!(req.cookies && req.cookies.refreshToken)) {
            return res.status(401).json({ error: "Invalid or expired token" })
        }

        const token = req.cookies.refreshToken as string;
        const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload

        req.userId = decoded.userId
        next()

    } catch (error) {
        next(error)
    }
}