import { test, expect } from "vitest"
import { generateToken } from "../src/modules/users/services/user.service.js"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../src/config/env.js"
import { Permission } from "@prisma/client"

test("Geração de token de MEMBRO", () => {
    const token = generateToken("UUID-123456", "7d")
    const parsedToken = jwt.verify(token, JWT_SECRET as jwt.Secret) as jwt.JwtPayload

    const userId = parsedToken.userId

    expect(userId).toBe("UUID-123456")
})

test("Geração de token de ADMIN", () => {
    const token = generateToken("UUID-123456", "7d", Permission.ADMIN)
    const parsedToken = jwt.verify(token, JWT_SECRET as jwt.Secret) as jwt.JwtPayload

    // A informação de "Admin" deve ser conservada ao decodificar o token
    expect(parsedToken.permission).toBe("ADMIN")
})