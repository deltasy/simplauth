import { app } from "../../../server.js"
import { describe, test, expect } from "vitest"
import request from "supertest"

import { JWT_SECRET } from "../../../config/env.js"

import jwt, { type JwtPayload } from "jsonwebtoken"
import { Permission } from "@prisma/client"
import { randomUUID } from "node:crypto"

import { extractCookieValue, extractTokens } from "../../../shared/__tests__/http.helper.js"
import { memberUser, adminUser } from "../../../shared/__tests__/prisma.helper.js"
import { routesMetadataV1 } from "../../../shared/routes/v1.metadata.js";


const { refreshRoute, signInRoute, signUpRoute, logoutRoute } = routesMetadataV1;



describe("Pipeline: Registro", () => {
    test("Requisição inválida (E-mail mal formatado)", async () => {
        const response = await request(app)
            .post(signUpRoute.raw)
            .send({
                "email": "gmail.com",
                "password": memberUser.password
            })

        // BAD REQUEST
        expect(response.status).toBe(422)
    })

    test("Requisição inválida (Senha pequena)", async () => {
        const response = await request(app)
            .post(signUpRoute.raw)
            .send({
                "email": memberUser.email,
                "password": "1"
            })

        // BAD REQUEST
        expect(response.status).toBe(422)
    })


    const newUserEmail = `test-${randomUUID()}@gmail.com`
    test("Registro OK", async () => {
        const response = await request(app)
            .post(signUpRoute.raw)
            .send({
                "email": newUserEmail,
                "password": "12345"
            })

        // STATUS: CREATED
        expect(response.status).toBe(201)

        const [userId, token] = response.body
        const validToken = jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload

        // Token válido
        expect(validToken.userId).toBe(userId)
    })

    test("Registro duplicado", async () => {
        const response = await request(app)
            .post(signUpRoute.raw)
            .send({
                "email": newUserEmail,
                "password": "12345"
            })

        // STATUS: CONFLICT
        expect(response.status).toBe(409)
    })

})

describe("Pipeline: Login", () => {
    test("Login OK", async () => {
        const response = await request(app)
            .post(signInRoute.raw)
            .send(memberUser)

        // STATUS: OK
        expect(response.status).toBe(200)

        const { token } = response.body
        const validAccessToken = jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload
        expect(validAccessToken).toBeDefined()
        expect(validAccessToken.jti).toBeUndefined() // jti indefinido
        expect(validAccessToken.permission).toBeUndefined() // O usuário não é admin, logo não tem o campo "permissão" no payload

        const cookie = response.headers["set-cookie"]!
        expect(cookie).toBeDefined()

        const refreshToken = extractCookieValue(cookie, 'refreshToken') as string;
        const validRefreshToken = jwt.verify(refreshToken, JWT_SECRET as jwt.Secret) as JwtPayload
        expect(validRefreshToken).toBeDefined()
        expect(validRefreshToken.jti).toBeDefined() // jti definido (é exclusivo dos refresh tokens)
    })

    test("Login OK (ADMIN)", async () => {
        const response = await request(app)
            .post(signInRoute.raw)
            .send(adminUser)

        // STATUS: OK
        expect(response.status).toBe(200)


        const { token } = response.body
        const validAccessToken = jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload
        expect(validAccessToken.permission).toBe(Permission.ADMIN) // O usuário é admin, logo o campo "permissão" existe
    })

    test("Login inválido", async () => {
        const response = await request(app)
            .post(signInRoute.raw)
            .send({
                "email": "not_registered@gmail.com",
                "password": "12345"
            })

        // STATUS: UNAUTHORIZED
        expect(response.status).toBe(401)
    })
})

describe("Pipeline: Refresh", () => {
    test("Rotação de tokens bem-sucedida", async () => {
        // Login
        const loginResponse = await request(app)
            .post(signInRoute.raw)
            .send(memberUser);


        const { accessToken: AT1, refreshToken: RT1 } = extractTokens(loginResponse);

        // 1ª Rotação de tokens
        const refreshResponse1 = await request(app)
            .get(refreshRoute.raw)
            .set('Cookie', `refreshToken=${RT1}`)
            .set('Authorization', `Bearer ${AT1}`);


        expect(refreshResponse1.status).toBe(200);
        const { accessToken: AT2, refreshToken: RT2 } = extractTokens(refreshResponse1);

        // 2ª Rotação de tokens
        const refreshResponse2 = await request(app)
            .get(refreshRoute.raw)
            .set('Cookie', `refreshToken=${RT2}`)
            .set('Authorization', `Bearer ${AT2}`);


        expect(refreshResponse2.status).toBe(200);
    });

    test("Detecção de reuso de tokens", async () => {
        // Login
        const loginResponse = await request(app)
            .post(signInRoute.raw)
            .send(memberUser);


        const { accessToken: AT1, refreshToken: RT1 } = extractTokens(loginResponse);

        // Rotação de tokens
        const validRefreshResponse = await request(app)
            .get(refreshRoute.raw)
            .set('Cookie', `refreshToken=${RT1}`)
            .set('Authorization', `Bearer ${AT1}`);



        const { accessToken: AT2, refreshToken: RT2 } = extractTokens(validRefreshResponse);
        expect(validRefreshResponse.status).toBe(200);

        // Reuso de tokens (usuário malicioso)
        const attackResponse = await request(app)
            .get(refreshRoute.raw)
            .set('Cookie', `refreshToken=${RT1}`)
            .set('Authorization', `Bearer ${AT1}`);

        expect(attackResponse.status).toBe(403);



        // Tentativa de rotação de tokens (Será negada, pois por motivos de segurança, o usuário legítimo também foi desconectado)
        const victimResponse = await request(app)
            .get(refreshRoute.raw)
            .set('Cookie', `refreshToken=${RT2}`)
            .set('Authorization', `Bearer ${AT2}`);

        expect(victimResponse.status).toBe(403);
    });
});

describe("Pipeline: Logout", () => {
    test("Logout bem-sucedido", async () => {
        const loginResponse = await request(app)
            .post(signInRoute.raw)
            .send(memberUser);

        const { accessToken, refreshToken } = extractTokens(loginResponse);



        const logoutResponse = await request(app)
            .post(logoutRoute.raw)
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set("Authorization", `Bearer ${accessToken}`)

        expect(logoutResponse.status).toBe(200)

        // Tentativa de refresh de token (Será inválida, pois quando o usuário desloga, o refreshToken é queimado)
        const refreshResponse = await request(app)
            .get(refreshRoute.raw)
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(refreshResponse.status).toBe(403)
    });
})