import request from "supertest"
import { test, expect, describe, beforeAll } from "vitest"

import { app, routeData } from "../../../server.js"
import { JWT_SECRET } from "../../../config/env.js"

import jwt, { type JwtPayload } from "jsonwebtoken"
import { Permission } from "@prisma/client"

import { extractCookieValue, extractTokens } from "../../../shared/__tests__/http.helper.js"
import { createTestUser } from "../../../shared/__tests__/prisma.helper.js"
import { randomUUID } from "node:crypto"

const usersRoute = routeData.usersUrl
const refreshRoute = usersRoute + "/refresh"
const signInRoute = routeData.signInRoute

const memberUser = await createTestUser();
const adminUser = await createTestUser(Permission.ADMIN);

describe("Pipeline: Registro", () => {
    const pipelineRoute = usersRoute + "/sign-up"

    test("Requisição inválida (E-mail mal formatado)", async () => {
        const response = await request(app)
            .post(pipelineRoute)
            .send({
                "email": "gmail.com",
                "password": memberUser.password
            })

        // BAD REQUEST
        expect(response.status).toBe(400)
    })

    test("Requisição inválida (Senha pequena)", async () => {
        const response = await request(app)
            .post(pipelineRoute)
            .send({
                "email": memberUser.email,
                "password": "1"
            })

        // BAD REQUEST
        expect(response.status).toBe(400)
    })


    const newUserEmail = `test-${randomUUID()}@gmail.com`
    test("Registro OK", async () => {
        const response = await request(app)
            .post(pipelineRoute)
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
            .post(pipelineRoute)
            .send({
                "email": newUserEmail,
                "password": "12345"
            })

        // STATUS: CONFLICT
        expect(response.status).toBe(409)
    })

})

describe("Pipeline: Login", () => {
    const pipelineRoute = usersRoute + "/sign-in"

    test("Login OK", async () => {
        const response = await request(app)
            .post(pipelineRoute)
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
            .post(pipelineRoute)
            .send(adminUser)

        // STATUS: OK
        expect(response.status).toBe(200)

        
        const { token } = response.body
        const validAccessToken = jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload
        expect(validAccessToken.permission).toBe(Permission.ADMIN) // O usuário é admin, logo o campo "permissão" existe
    })

    test("Login inválido", async () => {
        const response = await request(app)
            .post(pipelineRoute)
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
            .post(signInRoute)
            .send(memberUser);


        const { accessToken: AT1, refreshToken: RT1 } = extractTokens(loginResponse);

        // 1ª Rotação de tokens
        const refreshResponse1 = await request(app)
            .get(refreshRoute)
            .set('Cookie', `refreshToken=${RT1}`)
            .set('Authorization', `Bearer ${AT1}`);


        expect(refreshResponse1.status).toBe(200);
        const { accessToken: AT2, refreshToken: RT2 } = extractTokens(refreshResponse1);

        // 2ª Rotação de tokens
        const refreshResponse2 = await request(app)
            .get(refreshRoute)
            .set('Cookie', `refreshToken=${RT2}`)
            .set('Authorization', `Bearer ${AT2}`);


        expect(refreshResponse2.status).toBe(200);
    });

    test("Detecção de reuso de tokens", async () => {
        // Login
        const loginResponse = await request(app)
            .post(signInRoute)
            .send(memberUser);


        const { accessToken: AT1, refreshToken: RT1 } = extractTokens(loginResponse);

        // Rotação de tokens
        const validRefreshResponse = await request(app)
            .get(refreshRoute)
            .set('Cookie', `refreshToken=${RT1}`)
            .set('Authorization', `Bearer ${AT1}`);
            


        const { accessToken: AT2, refreshToken: RT2 } = extractTokens(validRefreshResponse);
        expect(validRefreshResponse.status).toBe(200);

        // Reuso de tokens (usuário malicioso)
        const attackResponse = await request(app)
            .get(refreshRoute)
            .set('Cookie', `refreshToken=${RT1}`)
            .set('Authorization', `Bearer ${AT1}`);
 
        expect(attackResponse.status).toBe(403); 



        // Tentativa de rotação de tokens (Será negada, pois por motivos de segurança, o usuário legítimo também foi desconectado)
        const victimResponse = await request(app)
            .get(refreshRoute)
            .set('Cookie', `refreshToken=${RT2}`)
            .set('Authorization', `Bearer ${AT2}`);
            
        expect(victimResponse.status).toBe(403); 
    });
});

describe("Pipeline: Logout", () => {
    const pipelineRoute = usersRoute + "/logout"

    test("Logout bem-sucedido", async () => {
        const loginResponse = await request(app)
            .post(signInRoute)
            .send(memberUser);

        const { accessToken, refreshToken } = extractTokens(loginResponse);
        


        const logoutResponse = await request(app)
            .post(pipelineRoute)
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set("Authorization", `Bearer ${accessToken}`)

        expect(logoutResponse.status).toBe(200)

        // Tentativa de refresh de token (Será inválida, pois quando o usuário desloga, o refreshToken é queimado)
        const refreshResponse = await request(app)
            .get(refreshRoute)
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(refreshResponse.status).toBe(403)
    })

    test("Token(s) inválido(s)", async () => {
        const loginResponse = await request(app)
            .post(signInRoute)
            .send(memberUser);

        const { accessToken, refreshToken } = extractTokens(loginResponse);
        

        const logoutResponse1 = await request(app)
            .post(pipelineRoute)
            .set('Cookie', `refreshToken=INVALID`)
            .set("Authorization", `Bearer ${accessToken}`)

        expect(logoutResponse1.status).toBe(401)

        const logoutResponse2 = await request(app)
            .post(pipelineRoute)
            .set('Cookie', `refreshToken=${refreshRoute}`)
            .set("Authorization", `Bearer INVALID`)

        expect(logoutResponse2.status).toBe(401)
    })
})


describe("Pipeline: Dados do usuário atual (this)", () => {
    const pipelineRoute = usersRoute + "/this"

    test("Usuário logado", async () => {
        const loginResponse = await request(app)
            .post(signInRoute)
            .send(memberUser);

        const { accessToken, refreshToken } = extractTokens(loginResponse);
        
        const thisUserResponse = await request(app)
            .get(pipelineRoute)
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set("Authorization", `Bearer ${accessToken}`)

        expect(thisUserResponse.status).toBe(200)
    })

    test("Access Token inválido", async () => {
        const loginResponse = await request(app)
            .post(signInRoute)
            .send(memberUser);

        const { accessToken } = extractTokens(loginResponse);
        
        // Token válido
        const validTokenResponse = await request(app)
            .get(pipelineRoute)
            .set("Authorization", `Bearer ${accessToken}`)

        expect(validTokenResponse.status).toBe(200)

        // Token inválido
        const invalidTokenResponse = await request(app)
            .get(pipelineRoute)
            .set("Authorization", `Bearer INVALID`)

        expect(invalidTokenResponse.status).toBe(401)
    })

})

//  /:profile_name
describe("Pipeline: Perfil público", () => {
    const pipelineRoute = usersRoute + "/"

    test("Usuário visita perfil inexistente", async () => {
        const profile = "UNKNOWN"


        const loginResponse = await request(app)
            .post(signInRoute)
            .send(memberUser);

        const { accessToken, refreshToken } = extractTokens(loginResponse);
        
        const unknownUserResponse = await request(app)
            .get(pipelineRoute + profile)
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set("Authorization", `Bearer ${accessToken}`)

        expect(unknownUserResponse.status).toBe(404)
    })

    test("Usuário visita perfil existente", async () => {
        const profile = adminUser.username


        const loginResponse = await request(app)
            .post(signInRoute)
            .send(memberUser);

        const { accessToken, refreshToken } = extractTokens(loginResponse);
        

        const response = await request(app)
            .get(pipelineRoute + profile)
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(200)

        // "E-mail" não aparece na response
        expect(response.body.email).toBeUndefined()
    })

    test("Usuário acessa o próprio perfil", async () => {
        // Quando isso acontece, informações normalmente privadas estarão visíveis (pois é o próprio usuário)
        const profile = memberUser.username


        const loginResponse = await request(app)
            .post(signInRoute)
            .send(memberUser);

        const { accessToken, refreshToken } = extractTokens(loginResponse);
        

        const response = await request(app)
            .get(pipelineRoute + profile)
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(200)

        // "E-mail" aparece pro próprio usuário
        expect(response.body.email).toBeDefined()
    })

})
