import { test, expect } from "vitest"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../../shared/config/env.js"

import { Permission } from "@prisma/client"

import { AuthService } from "../src/modules/auth/auth.service.js"



test("Geração de token de MEMBRO", () => {
    const token = AuthService.generateToken("UUID-123456", "7d")
    const parsedToken = jwt.verify(token, JWT_SECRET as jwt.Secret) as jwt.JwtPayload

    const userId = parsedToken.userId

    expect(userId).toBe("UUID-123456")
})

test("Geração de token de ADMIN", () => {
    const token = AuthService.generateToken("UUID-123456", "7d", Permission.ADMIN)
    const parsedToken = jwt.verify(token, JWT_SECRET as jwt.Secret) as jwt.JwtPayload

    // A informação de "Admin" deve ser conservada ao decodificar o token
    expect(parsedToken.permission).toBe("ADMIN")
})