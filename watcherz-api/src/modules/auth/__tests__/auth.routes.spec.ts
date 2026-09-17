import { app } from "../../../server.js"
import { describe, test, expect } from "vitest"

import request from "supertest"

import { JWT_SECRET } from "../../../config/env.js"

import jwt, { type JwtPayload } from "jsonwebtoken"
import { Permission } from "@prisma/client"
import { randomUUID } from "node:crypto"

import { extractTokens } from "../../../shared/__tests__/http.helper.js"
import { memberUser, adminUser } from "../../../shared/__tests__/prisma.helper.js"
import { routesMetadataV1 } from "../../../../../shared/src/routes/v1.metadata.js";

import type { signRequest } from "../auth.schema.js"
import "../../../shared/__tests__/utils.js"


const { refreshRoute, signInRoute, signUpRoute, logoutRoute } = routesMetadataV1;

describe("Pipeline: Registro", () => {
    test("Requisição inválida (E-mail mal formatado)", async () => {
        const { response } = await signCatch("sign-up", {
            "email": "email",
            "password": memberUser.password
        });
        expect(response.status).toBe(422)
    })

    test("Requisição inválida (Senha pequena)", async () => {
        const { response } = await signCatch("sign-up", {
            "email": memberUser.email,
            "password": "1"
        });
        expect(response.status).toBe(422)
    })

    const newUserEmail = `test-${randomUUID()}@gmail.com`
    test("Registro OK", async () => {
        const { response } = await signCatch("sign-up", {
            "email": newUserEmail,
            "password": "12345"
        });

        expect(response.status).toBe(201) // CREATED

        const { id: userId, token: accessToken } = response.body
        const validToken = jwt.verify(accessToken, JWT_SECRET as jwt.Secret) as JwtPayload

        expect(validToken.userId).toBe(userId) // Token válido
    })

    test("Registro duplicado", async () => {
        const { response } = await signCatch("sign-up", {
            "email": newUserEmail,
            "password": "12345"
        });
        expect(response.status).toBe(409) // CONFLICT
    })

})

describe("Pipeline: Login", () => {
    test("Login OK", async () => {
        const { response, accessToken, refreshToken } = await signCatch("sign-in", memberUser);
        expect(response.status).toBe(200);

        const validAccessToken = jwt.verify(accessToken, JWT_SECRET as jwt.Secret) as JwtPayload;
        expect(validAccessToken).toBeDefined();
        expect(validAccessToken.jti).toBeUndefined(); // jti indefinido
        expect(validAccessToken.permission).toBeUndefined(); // O usuário não é admin, logo não tem o campo "permissão" no payload

        const validRefreshToken = jwt.verify(refreshToken, JWT_SECRET as jwt.Secret) as JwtPayload;
        expect(validRefreshToken).toBeDefined();
        expect(validRefreshToken.jti).toBeDefined(); // jti definido (é exclusivo dos refresh tokens)
    })

    test("Login OK (ADMIN)", async () => {
        const { response, accessToken } = await signCatch("sign-in", adminUser);
        expect(response.status).toBe(200);

        const validAccessToken = jwt.verify(accessToken, JWT_SECRET as jwt.Secret) as JwtPayload;
        expect(validAccessToken.permission).toBe(Permission.ADMIN); // O usuário é admin, logo o campo "permissão" existe
    })

    test("Login inválido", async () => {
        const { response } = await signCatch("sign-in", {
            "email": "not_registered@gmail.com",
            "password": "12345"
        });;
        expect(response.status).toBe(401); // NÃO AUTORIZADO
    })
})

describe("Pipeline: Refresh", () => {
    test("Rotação de tokens bem-sucedida", async () => {
        // Login
        const { accessToken: AToken1, refreshToken: RToken1 } = await signCatch("sign-in", memberUser);

        // 1ª Rotação de tokens
        const refreshResponse1 = await request(app)
            .get(refreshRoute.raw).withAuth(AToken1, RToken1);

        expect(refreshResponse1.status).toBe(200);


        const { accessToken: AToken2, refreshToken: RToken2 } = extractTokens(refreshResponse1);

        // 2ª Rotação de tokens
        const refreshResponse2 = await request(app)
            .get(refreshRoute.raw).withAuth(AToken2, RToken2);

        expect(refreshResponse2.status).toBe(200);
    });

    test("Detecção de reuso de tokens", async () => {
        // Login
        const { accessToken: AToken1, refreshToken: RToken1 } = await signCatch("sign-in", memberUser);

        // Rotação de tokens
        const validRefreshResponse = await request(app)
            .get(refreshRoute.raw).withAuth(AToken1, RToken1);

        const { accessToken: AToken2, refreshToken: RToken2 } = extractTokens(validRefreshResponse);

        // Reuso de tokens (usuário malicioso)
        const attackResponse = await request(app)
            .get(refreshRoute.raw).withAuth(AToken1, RToken1);

        expect(attackResponse.status).toBe(403);

        // 2ª Rotação de tokens (Dará erro. Por motivos de segurança, o usuário legítimo também é desconectado)
        const victimResponse = await request(app)
            .get(refreshRoute.raw).withAuth(AToken2, RToken2);

        expect(victimResponse.status).toBe(403);
    });
});

describe("Pipeline: Logout", () => {
    test("Logout bem-sucedido", async () => {
        const { accessToken, refreshToken } = await signCatch('sign-in', memberUser);

        const logoutResponse = await request(app)
            .post(logoutRoute.raw).withAuth(accessToken, refreshToken);

        expect(logoutResponse.status).toBe(200);

        // Tentativa de refresh de token (Será inválida, pois quando o usuário desloga, o refreshToken é queimado)
        const refreshResponse = await request(app)
            .get(refreshRoute.raw).withAuth(accessToken, refreshToken);

        expect(refreshResponse.status).toBe(403)
    });
})


// Monkey patching
export async function signCatch(mode: "sign-in" | "sign-up", payload: signRequest) {
    const response = await request(app)
        .post(mode === "sign-in" ? signInRoute.raw : signUpRoute.raw)
        .send(payload);

    return { response, ...extractTokens(response) };
};
