import type { Request, Response, NextFunction } from "express";

import {
    JWT_RTOKEN_EXPIRES_MS,
    ENV_TYPE,
} from "../../../config/env.js";

import { UserService } from "../../users/user.service.js";
import { AuthService } from "../auth.service.js";


import { routesMetadataV1 } from "../../../../../shared/src/routes/v1.metadata.js";


export const AuthController = {



    async signUp(req: Request, res: Response, next: NextFunction) {
        try {
            const newUser = await UserService.createUser(req.body);
            const { accessToken, refreshToken } = await AuthService.renewTokens(newUser.id)
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                path: routesMetadataV1.baseUrl,
                secure: ENV_TYPE === "production",
                sameSite: "strict",
                maxAge: JWT_RTOKEN_EXPIRES_MS
            });

            return res.status(201).json({ id: newUser.id, token: accessToken });

        } catch (error) {
            next(error);
        }
    },

    async signIn(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            const user = await AuthService.verifyPassword(email, password);
            if (!user) {
                return res.status(401).json({ error: "Credenciais inválidas" })
            }

            const { accessToken, refreshToken } = await AuthService.renewTokens(user.id, user.permission)
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                path: routesMetadataV1.baseUrl,
                secure: ENV_TYPE === "production",
                sameSite: "strict",
                maxAge: JWT_RTOKEN_EXPIRES_MS
            });

            return res.status(200).json({ token: accessToken })

        } catch (error) {
            next(error);
        }
    },

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            try {
                const token = req.cookies.refreshToken as string;
                await AuthService.revokeRefreshToken(token)
                res.cookie("refreshToken", '', {
                    httpOnly: true,
                    path: routesMetadataV1.baseUrl,
                    secure: ENV_TYPE === "production",
                    sameSite: "strict",
                    expires: new Date(0)
                });

            } catch (error) { } // Se o token era inválido, ignore. Deslogue mesmo assim

            return res.status(200).json({ message: "Deslogado com sucesso" });

        } catch (error) {
            next(error)
        }
    },

    async renewTokens(req: Request, res: Response, next: NextFunction) {
        try {
            // "userId" e "permission" obtidos pelo assertRefreshToken (middleware de refresh token)
            const user = await UserService.fetchUser({ id: req.userId as string, is_deleted: false });
            if (!user) {
                return res.status(401).json({ error: "Usuário não encontrado ou deletado" });
            }

            const { accessToken, refreshToken } = await AuthService.renewTokens(
                user.id,
                user.permission,
                req.cookies.refreshToken as string
            )

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                path: routesMetadataV1.baseUrl,
                secure: ENV_TYPE === "production",
                sameSite: "strict",
                maxAge: JWT_RTOKEN_EXPIRES_MS
            })

            return res.status(200).json({ token: accessToken })

        } catch (error: any) {
            if (error.message === "CE-1") res.status(403); // Tentativa de reutilização de token

            next(error)
        }
    }
};