import { Permission } from "@prisma/client";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

import {
    JWT_SECRET,
    JWT_ATOKEN_EXPIRES_IN,
    JWT_RTOKEN_EXPIRES_IN,
    JWT_RTOKEN_EXPIRES_MS
} from "#config/env.js";

import { rTokenDB } from "#shared/database/prisma.service.js";
import { UserService } from "#users/user.service.js";



export const AuthService = {
    async fetchRefreshToken(token: string) {
        return await rTokenDB.findUniqueOrThrow({
            where: {
                token: token
            }
        });
    },

    async revokeRefreshToken(token: string) {
        return await rTokenDB.update({
            where: {
                token: token
            },
            data: {
                revoked: true
            }
        });
    },

    async createRefreshToken(userId: string, expirationTimeMs: number = JWT_RTOKEN_EXPIRES_MS) {
        const expirationDate = new Date(Date.now() + expirationTimeMs);

        const newToken = AuthService.generateToken(userId, JWT_RTOKEN_EXPIRES_IN!);
        await rTokenDB.create({
            data: {
                owner_id: userId,
                token: newToken,
                expires_at: expirationDate
            }
        });

        return { newToken, expirationTimeMs };
    },

    async verifyPassword(email: string, password: string) {
        const user = await UserService.fetchUser({ email: email, is_deleted: false });

        if (!user) {
            return false;
        }

        const correctPassword = await bcrypt.compare(password, user.passwordHash);
        if (!correctPassword) {
            return false;
        }

        const { passwordHash, ...safeUser } = user;
        return safeUser;
    },

    generateToken(id: string, expiration: string, permission?: Permission, jti?: string) {
        const payLoad = {
            userId: id,

            // Permission, optional (applied only if the user is ADMIN)
            ...(permission === Permission.ADMIN && { permission }),

            // JTI, optional (applied only to refresh tokens, to ensure a unique signature)
            ...(jti && { jti }),
        };

        return jwt.sign(
            payLoad,
            JWT_SECRET as jwt.Secret,
            { expiresIn: expiration } as jwt.SignOptions
        );
    },

    // Expires every 7 days by default
    async renewTokens(userId: string, userPermission?: Permission, oldRefreshToken?: string) {
        if (oldRefreshToken) { // Burn old refresh token
            // A malicious user tried to use an already revoked token
            const reusingToken = await rTokenDB.findFirst({
                where: {
                    token: oldRefreshToken,
                    revoked: true
                }
            });

            if (reusingToken) {
                // Disconnect all sessions of these users
                await rTokenDB.updateMany({
                    where: {
                        owner_id: userId
                    },
                    data: {
                        revoked: true
                    }
                });

                throw new Error("CE-1", { cause: "This token has already been used" });
            }

            await AuthService.revokeRefreshToken(oldRefreshToken);
        }

        const accessToken = AuthService.generateToken(userId, JWT_ATOKEN_EXPIRES_IN!, userPermission);
        const refreshToken = AuthService.generateToken(userId, JWT_RTOKEN_EXPIRES_IN!, userPermission, randomUUID());

        const expirationDate = new Date(Date.now() + JWT_RTOKEN_EXPIRES_MS);

        await rTokenDB.create({
            data: {
                owner_id: userId,
                token: refreshToken,
                expires_at: expirationDate
            }
        });

        // Return parameters that will create the cookie
        return { accessToken, refreshToken };
    },

    async hashPassword(password: string) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }
};