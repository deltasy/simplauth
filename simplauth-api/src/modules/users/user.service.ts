import { Prisma } from "@prisma/client";

import { userDB } from "#shared/database/prisma.service.js";
import { AuthService } from "#auth/auth.service.js";
import type { User } from "./user.schema.js";

export const UserService = {
    // Unrestricted fetch (no limitations) that is only used for internal validations
    async fetchUser(whereArg: Prisma.UserWhereInput) {
        return await userDB.findFirst({
            where: whereArg
        });
    },

    async fetchCurrentUser(whereArg: Prisma.UserWhereInput) {
        return await userDB.findFirst({
            where: whereArg,
            omit: {
                id: true,
                passwordHash: true,
                is_deleted: true
            }
        });
    },

    // Default fetch that doesn't show sensitive data
    async fetchUserProfile(whereArg: Prisma.UserWhereInput) {
        return await userDB.findFirst({
            where: whereArg,
            omit: {
                id: true,
                passwordHash: true,
                email: true,
                permission: true,
                is_deleted: true
            }
        });
    },

    
    async editCurrentUser(userId: string, editArg: Prisma.UserUpdateArgs) {
        return await userDB.updateMany({
            where: {
                id: userId,
                is_deleted: false
            },
            data: editArg
        });
    },

    async deleteCurrentUser(userId: string) {
        await userDB.updateMany({
            where: {
                id: userId,
                is_deleted: false
            },
            data: {
                is_deleted: true
            }
        });
    },

    async createUser(user: User) {
        const { email, password, username } = user;

        return await userDB.create({
            data: {
                username: username!,
                email: email,
                passwordHash: await AuthService.hashPassword(password),
            }
        });
    }
}

