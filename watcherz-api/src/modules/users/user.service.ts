import {
    JWT_ATOKEN_EXPIRES_IN
} from "../../config/env.js";

import { prisma } from "../../shared/database/prisma.service.js";
import { Prisma } from "@prisma/client";

import type { User } from "./user.schema.js";
import { generateToken, passwordHasher } from "../auth/auth.service.js";


const userDB = prisma.user

// Fetch irrestrito (sem limitações) que só é usado para validações internas
export async function fetchUserFull(whereArg: Prisma.UserWhereUniqueInput) {
    return await userDB.findUnique({
        where: whereArg
    });
}

// Fetch que retorna dados mais detalhados
export async function fetchMyUser(whereArg: Prisma.UserWhereUniqueInput) {
    return await userDB.findUnique({
        where: whereArg,
        omit: {
            id: true,
            passwordHash: true
        }
    });
}

// Fetch padrão que não mostra dados sensíveis
export async function fetchUser(whereArg: Prisma.UserWhereUniqueInput) {
    return await userDB.findUnique({
        where: whereArg,
        omit: {
            id: true,
            passwordHash: true,
            email: true,
            permission: true
        }
    });
}

export async function editUser(whereArg: Prisma.UserWhereUniqueInput, editArg: Prisma.UserUpdateArgs) {
    return await userDB.update({
        where: whereArg,
        data: editArg
    });
}

export async function showUsers() {
    return await userDB.findMany({})
}

export async function createUser(user: User) {
    const { email, password, username } = user;

    const newUser = await userDB.create({
        data: {
            username: username!,
            email: email,
            passwordHash: await passwordHasher(password),
        }
    })
    return [newUser.id, generateToken(newUser.id, JWT_ATOKEN_EXPIRES_IN!)]
}

