import { JWT_EXPIRES_IN, JWT_SECRET } from "../../../config/env.js";
import { prisma } from "../../../shared/database/prisma.service.js";
import type { User } from "../user.schema.js";

import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const DB = prisma.user

export async function fetchUser(whereArg: Prisma.UserWhereUniqueInput) {
    return await DB.findUnique({
        where: whereArg
    });
}

// Fetch que não mostra dados sensíveis
export async function fetchUserRestrict(whereArg: Prisma.UserWhereUniqueInput) {
    return await DB.findUnique({
        where: whereArg,
        omit: {
            id: true,
            passwordHash: true,
            email: true
        }
    });
}

export async function showUsers(){
    return await DB.findMany({})
}

export async function createUser(user: User){
    const { email, password, username } = user;

    const newUser = await DB.create({
        data: {
            username: username!,
            email: email,
            passwordHash: await passwordHasher(password),
        }
    })
    return [newUser.id, generateToken(newUser.id)]
}

export async function verifyPassword(email: string, password: string) {
    const user = await fetchUser({email: email});
    if(!user){
        return false;
    }

    const correctPassword = await bcrypt.compare(password, user.passwordHash)

    if(!correctPassword){
        return false;
    }

    const { passwordHash, ...safeUser} = user;
    return { 
        user: safeUser, 
        token: generateToken(user.id)
    };
}

async function passwordHasher(password: string){
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt)
}

function generateToken(id: string) {
    return jwt.sign(
        { userId: id }, 
        JWT_SECRET as jwt.Secret, 
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );
}
