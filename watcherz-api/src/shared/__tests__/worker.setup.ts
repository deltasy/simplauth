import { afterAll } from "vitest";
import { prisma } from "../database/prisma.service.js";

// Mata cada worker (cada teste) assim que os testes dele acabam
afterAll(() => prisma.$disconnect);