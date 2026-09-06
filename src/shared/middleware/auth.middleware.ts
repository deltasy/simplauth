import type { Request, Response, NextFunction } from "express"

import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/env.js";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

interface TokenPayload {
    userId: string;
    iat: number;
    exp: number;
}


export const checkProfileOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];

        // Anônimo
        if (!(authHeader && authHeader.startsWith("Bearer "))) {
            return next();
        }

        // Anônimo
        const token = authHeader.split(" ")[1];

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as unknown as TokenPayload;
        req.userId = decoded.userId;
        
        return next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }
};

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!(authHeader && authHeader.startsWith("Bearer "))) {
            return res.status(401).json({ error: "Token inválido ou expirado." });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Token inválido ou expirado." });
        }

        // Se o token for falso, a exceção é arremessada e o catch captura.
        const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as unknown as TokenPayload;
        req.userId = decoded.userId;
        
        return next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }
};

