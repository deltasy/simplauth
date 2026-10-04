import type { NextFunction, Request, Response } from "express"

import { routesMetadataV1 } from "@simplauth/shared";

import { ENV_TYPE, JWT_RTOKEN_EXPIRES_MS } from "#config/env.js"

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

            return res.status(200).send({ message: "Cookie set" });

        } catch (error) {
            next(error);
        }
    },

    // Revert account that was deleted
    async restoreDeletedUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { username } = req.body;
            await AdminService.restoreDeletedUser(username);

            return res.status(200).json({ message: `User ${username} was restored` });

        } catch (error) {
            next(error);
        }
    }
};