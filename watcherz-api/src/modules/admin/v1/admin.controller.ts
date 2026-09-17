import type { NextFunction, Request, Response } from "express"
import { ENV_TYPE, JWT_RTOKEN_EXPIRES_MS } from "../../../../../shared/config/env.js"


import { routesMetadataV1 } from "../../../../../shared/src/routes/v1.metadata.js";

import { AdminService } from "../admin.service.js";

export const AdminController = {
    async setRefreshCookie(req: Request, res: Response, next: NextFunction) {
        try {
            const { cookie } = req.body;

            res.cookie("refreshToken", cookie, {
                httpOnly: true,
                path: routesMetadataV1.baseUrl,
                secure: ENV_TYPE === "production",
                sameSite: "strict",
                maxAge: JWT_RTOKEN_EXPIRES_MS
            });

            return res.status(200).send({ message: "Cookie setado" });

        } catch (error) {
            next(error);
        }
    },

    // Reverter conta que foi deletada
    async restoreDeletedUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { username } = req.body;
            await AdminService.restoreDeletedUser(username);

            return res.status(200).json({ message: `Usuário ${username} foi restaurado` });

        } catch (error) {
            next(error);
        }
    }
};