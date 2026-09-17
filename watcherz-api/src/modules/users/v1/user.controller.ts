import type { NextFunction, Request, Response } from "express"

import { AuthService } from "../../auth/auth.service.js";
import { ENV_TYPE } from "../../../config/env.js";
import { UserService } from "../user.service.js";

import { routesMetadataV1 } from "../../../../../shared/routes/v1.metadata.js";
import type { User } from "@prisma/client";

export const UserController = {
    async fetchCurrentUser(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await UserService.fetchCurrentUser({ id: req.userId!, is_deleted: false });
            return res.status(200).json(data);

        } catch (error) {
            next(error);
        }
    },

    async fetchUserProfile(req: Request, res: Response, next: NextFunction) {
        const targetUserName = req.params["profile_name"] as string;

        try {
            const currentUser = await UserService.fetchCurrentUser({ id: req.userId!, is_deleted: false }) as User;

            const data = await (
                targetUserName === currentUser.username ?
                    currentUser :
                    UserService.fetchUserProfile({ username: targetUserName, is_deleted: false })
            );

            if (!data) {
                return res.status(404).send({ error: "Esse usuário não existe" });
            }

            return res.status(200).json(data);

        } catch (error) {
            next(error);
        }
    },

    async editCurrentUser(req: Request, res: Response, next: NextFunction) {
        try {
            await UserService.editCurrentUser(req.userId!, req.body);
            return res.status(200).json({ message: "Campos alterados com sucesso" });

        } catch (error) {
            next(error);
        }
    },

    async deleteCurrentUser(req: Request, res: Response, next: NextFunction) {
        try {
            // Revogar refresh token
            const token = req.cookies?.refreshToken;
            await AuthService.revokeRefreshToken(token);
            res.cookie("refreshToken", '', {
                httpOnly: true,
                path: routesMetadataV1.baseUrl,
                secure: ENV_TYPE === "production",
                sameSite: "strict",
                expires: new Date(0)
            });

            await UserService.deleteCurrentUser(req.userId!);
            return res.status(200).json({ message: "Conta deletada com sucesso" });

        } catch (error) {
            next(error);
        }
    },
};