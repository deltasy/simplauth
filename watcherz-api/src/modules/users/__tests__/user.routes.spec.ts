import request from "supertest"
import { test, expect, describe } from "vitest"

import { app } from "../../../server.js"
import { extractTokens } from "../../../shared/__tests__/http.helper.js"
import { memberUser, adminUser } from "../../../shared/__tests__/prisma.helper.js"
import { routesMetadataV1 } from "../../../shared/routes/v1.metadata.js";

const { signInRoute, myUserRoute, userProfileRoute } = routesMetadataV1;


describe("Pipeline: Dados do usuário atual", () => {
    test("Usuário logado", async () => {
        const loginResponse = await request(app)
            .post(signInRoute.raw)
            .send(memberUser);

        const { accessToken, refreshToken } = extractTokens(loginResponse);

        const thisUserResponse = await request(app)
            .get(myUserRoute.raw)
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set("Authorization", `Bearer ${accessToken}`)

        expect(thisUserResponse.status).toBe(200)
    })

    test("Access Token inválido", async () => {
        const loginResponse = await request(app)
            .post(signInRoute.raw)
            .send(memberUser);

        const { accessToken } = extractTokens(loginResponse);

        // Token válido
        const validTokenResponse = await request(app)
            .get(myUserRoute.raw)
            .set("Authorization", `Bearer ${accessToken}`)

        expect(validTokenResponse.status).toBe(200)

        // Token inválido
        const invalidTokenResponse = await request(app)
            .get(myUserRoute.raw)
            .set("Authorization", `Bearer INVALID`)

        expect(invalidTokenResponse.status).toBe(401)
    })

})

describe("Pipeline: Perfil público", () => {
    test("Usuário visita perfil inexistente", async () => {
        const profile = "UNKNOWN"

        const loginResponse = await request(app)
            .post(signInRoute.raw)
            .send(memberUser);

        const { accessToken, refreshToken } = extractTokens(loginResponse);

        const unknownUserResponse = await request(app)
            .get(userProfileRoute.raw + profile)
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set("Authorization", `Bearer ${accessToken}`)

        expect(unknownUserResponse.status).toBe(404)
    })

    test("Usuário visita perfil existente", async () => {
        const profile = adminUser.username


        const loginResponse = await request(app)
            .post(signInRoute.raw)
            .send(memberUser);

        const { accessToken, refreshToken } = extractTokens(loginResponse);


        const response = await request(app)
            .get(userProfileRoute.raw + profile)
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
            .post(signInRoute.raw)
            .send(memberUser);

        const { accessToken, refreshToken } = extractTokens(loginResponse);


        const response = await request(app)
            .get(userProfileRoute.raw + profile)
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(200)

        // "E-mail" aparece pro próprio usuário
        expect(response.body.email).toBeDefined()
    })

})
