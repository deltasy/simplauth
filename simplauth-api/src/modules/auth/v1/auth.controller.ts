import type { Request, Response, NextFunction } from "express";

import { routesMetadataV1 } from "@simplauth/shared";

import {
    JWT_RTOKEN_EXPIRES_MS,
    ENV_TYPE,
} from "#config/env.js";


import { UserService } from "#users/user.service.js";
import { AuthService } from "../auth.service.js";



export const AuthController = {



    async signUp(req: Request, res: Response, next: NextFunction) {
        try {
            const newUser = await UserService.createUser(req.body);
            const { accessToken, refreshToken } = await AuthService.renewTokens(newUser.id)

            setRefreshToken(res, refreshToken);
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
                return res.status(401).json({ error: "Invalid credentials" })
            }

            const { accessToken, refreshToken } = await AuthService.renewTokens(user.id, user.permission)

            setRefreshToken(res, refreshToken);
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
                res.clearCookie("refreshToken");

            } catch (error) { } // If the token was invalid, ignore. Logout anyway

            return res.status(200).json({ message: "Logged out successfully" });

        } catch (error) {
            next(error)
        }
    },

    async renewTokens(req: Request, res: Response, next: NextFunction) {
        try {
            // "userId" and "permission" obtained by assertRefreshToken (refresh token middleware)
            const user = await UserService.fetchUser({ id: req.userId as string, is_deleted: false });
            if (!user) {
                return res.status(401).json({ error: "User not found or deleted" });
            }

            const { accessToken, refreshToken } = await AuthService.renewTokens(
                user.id,
                user.permission,
                req.cookies.refreshToken as string
            )

            setRefreshToken(res, refreshToken);
            return res.status(200).json({ token: accessToken })

        } catch (error: any) {
            if (error.message === "CE-1") res.status(403); // Attempt to reuse token

            next(error)
        }
    }
};

function setRefreshToken(res: Response, refreshToken: string) {
    return res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: routesMetadataV1.baseUrl,
        secure: ENV_TYPE === "production",
        sameSite: "strict",
        maxAge: JWT_RTOKEN_EXPIRES_MS
    })
}