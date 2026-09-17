import request from "supertest"
import { test, expect, describe } from "vitest"

import { app } from "../../../server.js"

import { memberUser, adminUser, createTestUser } from "../../../shared/__tests__/prisma.helper.js"
import { signCatch } from "../../auth/__tests__/auth.routes.spec.js"
import "../../../shared/__tests__/utils.js"

import { routesMetadataV1 } from "../../../../../shared/src/routes/v1.metadata.js";


const { myUserRoute, userProfileRoute, userEditRoute, userDeleteRoute } = routesMetadataV1;


describe("Pipeline: Dados do usuário atual", () => {
    test("Usuário logado", async () => {
        const { accessToken, refreshToken } = await signCatch("sign-in", memberUser);

        const thisUserResponse = await request(app)
            .get(myUserRoute.raw).withAuth(accessToken);

        expect(thisUserResponse.status).toBe(200);
    })

    test("Access Token inválido", async () => {
        const { accessToken } = await signCatch("sign-in", memberUser);

        // Token válido
        const validTokenResponse = await request(app)
            .get(myUserRoute.raw).withAuth(accessToken);

        expect(validTokenResponse.status).toBe(200)

        // Token inválido
        const invalidTokenResponse = await request(app)
            .get(myUserRoute.raw).withAuth("Bearer INVALID");

        expect(invalidTokenResponse.status).toBe(401)
    })

})

describe("Pipeline: Perfil público", () => {
    test("Usuário visita perfil inexistente", async () => {
        const profile = "UNKNOWN"

        const { accessToken } = await signCatch("sign-in", memberUser);

        const unknownUserResponse = await request(app)
            .get(userProfileRoute.raw + profile).withAuth(accessToken);

        expect(unknownUserResponse.status).toBe(404)
    })

    test("Usuário visita perfil existente", async () => {
        const profile = adminUser.username

        const { accessToken } = await signCatch("sign-in", memberUser);

        const response = await request(app)
            .get(userProfileRoute.raw + profile).withAuth(accessToken);

        expect(response.status).toBe(200);

        // "E-mail" não aparece na response
        expect(response.body.email).toBeUndefined();
    })

    test("Usuário acessa o próprio perfil", async () => {
        // Quando isso acontece, informações normalmente privadas estarão visíveis (pois é o próprio usuário)
        const profile = memberUser.username

        const { accessToken } = await signCatch("sign-in", memberUser);

        const response = await request(app)
            .get(userProfileRoute.raw + profile).withAuth(accessToken);

        expect(response.status).toBe(200);

        // "E-mail" aparece pro próprio usuário
        expect(response.body.email).toBeDefined();
    })

})



describe("Pipeline: Deletar conta", () => {
    test("OK", async () => {
        // Login
        const user = await createTestUser();

        const { accessToken, refreshToken } = await signCatch("sign-in", user);

        // Deletar conta
        const deleteResponse = await request(app)
            .delete(userDeleteRoute.raw).withAuth(accessToken, refreshToken);
        expect(deleteResponse.status).toBe(200);

        // Verificar se o perfil deixou de existir
        const { response } = await signCatch("sign-in", user);
        expect(response.status).toBe(401);
    });

    test("Refresh token inválido", async () => {
        // Login
        const { accessToken } = await signCatch("sign-in", memberUser);

        // Deletar conta
        const deleteResponse = await request(app)
            .get(userDeleteRoute.raw).withAuth(accessToken, "INVALID RTOKEN");
        expect(deleteResponse.status).toBe(404);
    });
})
