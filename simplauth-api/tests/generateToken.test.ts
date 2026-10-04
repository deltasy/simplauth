import { test, expect } from "vitest"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../src/config/env.js"

import { Permission } from "@prisma/client"

import { AuthService } from "../src/modules/auth/auth.service.js"



test("MEMBER token generation", () => {
    const token = AuthService.generateToken("UUID-123456", "7d")
    const parsedToken = jwt.verify(token, JWT_SECRET as jwt.Secret) as jwt.JwtPayload

    const userId = parsedToken.userId

    expect(userId).toBe("UUID-123456")
})

test("ADMIN token generation", () => {
    const token = AuthService.generateToken("UUID-123456", "7d", Permission.ADMIN)
    const parsedToken = jwt.verify(token, JWT_SECRET as jwt.Secret) as jwt.JwtPayload

    // "Admin" information must be preserved when decoding the token
    expect(parsedToken.permission).toBe("ADMIN")
})