import {
    JWT_SECRET,
    JWT_ATOKEN_EXPIRES_IN,
    JWT_RTOKEN_EXPIRES_IN,
    JWT_RTOKEN_EXPIRES_MS
} from "../../config/env.js";

import { prisma, rTokenDB } from "../../shared/database/prisma.service.js";
import { Permission } from "@prisma/client";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

import { UserService } from "../users/user.service.js";

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

            // Permissão, opcional (aplicado apenas se o usuário for ADMIN)
            ...(permission === Permission.ADMIN && { permission }),

            // JTI, opcional (aplicado apenas para refresh tokens, para garantir uma assinatura única)
            ...(jti && { jti }),
        };

        return jwt.sign(
            payLoad,
            JWT_SECRET as jwt.Secret,
            { expiresIn: expiration } as jwt.SignOptions
        );
    },

    // Expira a cada 7 dias por padrão
    async renewTokens(userId: string, userPermission?: Permission, oldRefreshToken?: string) {
        if (oldRefreshToken) { // Queimar refresh token antigo
            // Algum usuário mal intencionado tentou usar um token que já foi revogado
            const reusingToken = await rTokenDB.findFirst({
                where: {
                    token: oldRefreshToken,
                    revoked: true
                }
            });

            if (reusingToken) {
                // Desconectar todas as sessões desses usuários
                await rTokenDB.updateMany({
                    where: {
                        owner_id: userId
                    },
                    data: {
                        revoked: true
                    }
                });

                throw new Error("CE-1", { cause: "Esse token já foi utilizado" });
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

        // Retornar parâmetros que criarão o cookie
        return { accessToken, refreshToken };
    },

    async hashPassword(password: string) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }
};