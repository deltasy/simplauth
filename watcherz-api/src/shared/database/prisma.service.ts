import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { DATABASE_URL } from "../../config/env.js";

const connectionString = DATABASE_URL;

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });

export const userDB = prisma.user;
export const rTokenDB = prisma.refreshToken;