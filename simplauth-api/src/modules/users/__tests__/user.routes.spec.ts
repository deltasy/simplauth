import request from "supertest"
import { test, expect, describe } from "vitest"

import { app } from "../../../server.js"

import { memberUser, adminUser, createTestUser } from "../../../shared/__tests__/prisma.helper.js"
import { signCatch } from "../../auth/__tests__/auth.routes.spec.js"
import "../../../shared/__tests__/utils.js"

import { routesMetadataV1 } from "../../../../../shared/src/routes/v1.metadata.js";


const { myUserRoute, userProfileRoute, userEditRoute, checkAttRoute, userDeleteRoute } = routesMetadataV1;


describe("Pipeline: /me", () => {
    test("OK", async () => {
        const { accessToken } = await signCatch("sign-in", memberUser);

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

describe("Pipeline: /:profile_name", () => {
    test("OK (Visitar próprio perfil)", async () => {
        // Quando isso acontece, informações normalmente privadas estarão visíveis (pois é o próprio usuário)
        const profile = memberUser.username

        const { accessToken } = await signCatch("sign-in", memberUser);

        const response = await request(app)
            .get(userProfileRoute.raw + profile).withAuth(accessToken);

        expect(response.status).toBe(200);

        // "E-mail" aparece pro próprio usuário
        expect(response.body.email).toBeDefined();
    })

    test("OK (Visitar outro perfil)", async () => {
        const profile = adminUser.username

        const { accessToken } = await signCatch("sign-in", memberUser);

        const response = await request(app)
            .get(userProfileRoute.raw + profile).withAuth(accessToken);

        expect(response.status).toBe(200);

        // "E-mail" não aparece na response
        expect(response.body.email).toBeUndefined();
    })

    test("Inválido", async () => {
        const profile = "UNKNOWN"

        const { accessToken } = await signCatch("sign-in", memberUser);

        const unknownUserResponse = await request(app)
            .get(userProfileRoute.raw + profile).withAuth(accessToken);

        expect(unknownUserResponse.status).toBe(404)
    })

})


describe("Pipeline: /me/edit", () => {
    test("OK", async () => {
        // Login
        const user = await createTestUser();
        const { accessToken, refreshToken } = await signCatch("sign-in", user);

        const newUsername = "Fulano";

        const editResponse = await request(app)
            .put(userEditRoute.raw)
            .send({
                username: newUsername
            })
            .withAuth(accessToken, refreshToken);
        expect(editResponse.status).toBe(200);

        // Verificar se o campo foi alterado
        const response = await request(app)
            .get(myUserRoute.raw).withAuth(accessToken);
        expect(response.body.username).toBe(newUsername);
    });

    test("Campo indisponível", async () => {
        // Login
        const user = await createTestUser();
        const { accessToken, refreshToken } = await signCatch("sign-in", user);

        const editResponse = await request(app)
            .put(userEditRoute.raw)
            .send({
                permission: "ADMIN"
            })
            .withAuth(accessToken, refreshToken);
        expect(editResponse.status).toBe(422);
    });

    test("Refresh token inválido ou inexistente", async () => {
        // Login
        const { accessToken } = await signCatch("sign-in", memberUser);

        // Deletar conta
        const editResponse = await request(app)
            .put(userEditRoute.raw).withAuth(accessToken);
        expect(editResponse.status).toBe(401);
    });
})


describe("Pipeline: /me/delete", () => {
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

describe("Pipeline: /check?attr=val", () => {
    test("OK", async () => {
        // Login
        const { accessToken } = await signCatch("sign-in", memberUser);

        // Deletar conta
        const checkResponse = await request(app)
            .get(checkAttRoute.raw + "?username=uniqueUsername421").withAuth(accessToken);
        expect(checkResponse.status).toBe(200);
    });

    test("Atributo já existente", async () => {
        const { accessToken } = await signCatch("sign-in", memberUser);

        const checkResponse = await request(app)
            .get(checkAttRoute.raw + "?username=" + memberUser.username).withAuth(accessToken);
        expect(checkResponse.status).toBe(409);
    });

    test("Atributo inválido", async () => {
        const { accessToken } = await signCatch("sign-in", memberUser);

        const checkResponse = await request(app)
            .get(checkAttRoute.raw + "?invalid=value").withAuth(accessToken);
        expect(checkResponse.status).toBe(422);
    });

    test("Sessão inválida", async () => {
        const checkResponse = await request(app)
            .get(checkAttRoute.raw + "?username=uniqueUsername421").withAuth("INVALID ATOKEN");
        expect(checkResponse.status).toBe(401);
    });
})