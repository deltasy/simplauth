import type { Request, Response, NextFunction } from "express"

import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "#config/env.js";

interface TokenPayload {
    userId: string;
    iat: number;
    exp: number;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!(authHeader && authHeader.startsWith("Bearer "))) {
            return res.status(401).json({ error: "Invalid or expired token." });
        }

        let token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Invalid or expired token." });
        }

        const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload
        req.userId = decoded.userId
        req.permission = decoded.permission

        return next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];

        // Anonymous
        if (!(authHeader && authHeader.startsWith("Bearer "))) {
            return next();
        }

        // Anonymous
        const token = authHeader.split(" ")[1];

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as unknown as TokenPayload;
        req.userId = decoded.userId;

        return next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
};

