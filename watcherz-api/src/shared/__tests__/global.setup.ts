import { Permission } from "@prisma/client";
import { passwordHasher } from "../../modules/auth/auth.service.js";
import { prisma } from "../database/prisma.service.js";

export default async function () {
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({});

    // ADMIN
    await prisma.user.create({
        data: {
            email: "admin@gmail.com",
            passwordHash: await passwordHasher("12345"),
            permission: Permission.ADMIN
        }
    });

    // MEMBRO
    await prisma.user.create({
        data: {
            email: "member@gmail.com",
            passwordHash: await passwordHasher("12345")
        }
    });

    // Desconectar o prisma no final
    return async () => {
        await prisma.$disconnect();
    };
}