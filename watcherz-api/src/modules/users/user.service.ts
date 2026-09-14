import type { Request } from "express"
import {
    JWT_SECRET,
    JWT_ATOKEN_EXPIRES_IN, JWT_RTOKEN_EXPIRES_IN,
    JWT_RTOKEN_EXPIRES_MS
} from "../../config/env.js";

import { prisma } from "../../shared/database/prisma.service.js";
import type { User } from "./user.schema.js";

import { Prisma, Permission } from "@prisma/client";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { randomUUID } from "node:crypto";

const DB = prisma.user
const rtokenDB = prisma.refreshToken

export async function fetchUserFull(whereArg: Prisma.UserWhereUniqueInput) {
    return await DB.findUnique({
        where: whereArg
    });
}
export async function fetchMyUser(whereArg: Prisma.UserWhereUniqueInput) {
    return await DB.findUnique({
        where: whereArg,
        omit: {
            id: true,
            passwordHash: true
        }
    });
}

// Fetch que não mostra dados sensíveis
export async function fetchUser(whereArg: Prisma.UserWhereUniqueInput) {
    return await DB.findUnique({
        where: whereArg,
        omit: {
            id: true,
            passwordHash: true,
            email: true,
            permission: true
        }
    });
}

export async function fetchRefreshToken(token: string) {
    return await rtokenDB.findUniqueOrThrow({
        where: {
            token: token
        }
    })
}

export async function showUsers() {
    return await DB.findMany({})
}

export async function revokeRefreshToken(token: string) {
    await rtokenDB.update({
        where: {
            token: token
        },
        data: {
            revoked: true
        }
    })
}

export async function createRefreshToken(userId: string, expirationTimeMs: number = JWT_RTOKEN_EXPIRES_MS) {
    const expirationDate = new Date(Date.now() + expirationTimeMs);

    const newToken = generateToken(userId, JWT_RTOKEN_EXPIRES_IN!)
    await rtokenDB.create({
        data: {
            owner_id: userId,
            token: newToken,
            expires_at: expirationDate
        }
    })

    return { newToken, expirationTimeMs }
}

export async function createUser(user: User) {
    const { email, password, username } = user;

    const newUser = await DB.create({
        data: {
            username: username!,
            email: email,
            passwordHash: await passwordHasher(password),
        }
    })
    return [newUser.id, generateToken(newUser.id, JWT_ATOKEN_EXPIRES_IN!)]
}

export async function verifyPassword(email: string, password: string) {
    const user = await fetchUserFull({ email: email });

    if (!user) {
        return false;
    }

    const correctPassword = await bcrypt.compare(password, user.passwordHash)
    if (!correctPassword) {
        return false;
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
}

export async function passwordHasher(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt)
}

export function generateToken(id: string, expiration: string, permission?: Permission, jti?: string) {
    const payLoad = {
        userId: id,

        // Permissão, opcional (aplicado apenas se o usuário for ADMIN)
        ...(permission === Permission.ADMIN && { permission }),

        // JTI, opcional (aplicado apenas para refresh tokens, para garantir uma assinatura única)
        ...(jti && { jti }),
    }

    return jwt.sign(
        payLoad,
        JWT_SECRET as jwt.Secret,
        { expiresIn: expiration } as jwt.SignOptions
    );
}

// Expira a cada 7 dias por padrão
export async function renewTokens(userId: string, userPermission?: Permission, oldRefreshToken?: string) {
    if (oldRefreshToken) { // Queimar refresh token antigo

        // Algum usuário mal intencionado tentou usar um token que já foi revogado
        const reusingToken = await rtokenDB.findFirst({
            where: {
                token: oldRefreshToken,
                revoked: true
            }
        })

        if (reusingToken) {

            // Desconectar todas as sessões desses usuários
            await rtokenDB.updateMany({
                where: {
                    owner_id: userId
                },
                data: {
                    revoked: true
                }
            })

            throw new Error("CE-1", { cause: "Esse token já foi utilizado" });
        }

        await revokeRefreshToken(oldRefreshToken)
    }

    const accessToken = generateToken(userId, JWT_ATOKEN_EXPIRES_IN!, userPermission)
    const refreshToken = generateToken(userId, JWT_RTOKEN_EXPIRES_IN!, userPermission, randomUUID())

    const expirationDate = new Date(Date.now() + JWT_RTOKEN_EXPIRES_MS);

    await rtokenDB.create({
        data: {
            owner_id: userId,
            token: refreshToken,
            expires_at: expirationDate
        }
    })

    // Retornar parâmetros que criarão o cookie
    return { accessToken, refreshToken }
}
