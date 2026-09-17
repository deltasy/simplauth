import { Permission, type User } from "@prisma/client";
import { prisma } from "../database/prisma.service.js";
import { randomUUID } from "node:crypto";
import { AuthService } from "../../modules/auth/auth.service.js";
import { userSchema } from "../../modules/users/user.schema.js";

export const memberUser = await createTestUser();
export const adminUser = await createTestUser(Permission.ADMIN);

export async function createTestUser(permission?: Permission){
    const userPayload = {
        email: `test-${randomUUID()}@gmail.com`,
        username: `U${randomUUID().substring(0, 10)}`,
        password: "12345",
        permission: permission || Permission.MEMBER
    }

    await prisma.user.create({
        data: {
            email: userPayload.email,
            passwordHash: await AuthService.hashPassword(userPayload.password),
            username: userPayload.username,
            permission: userPayload.permission
        }
    })

    // Objeto usuário
    return userSchema.parse(userPayload)
}