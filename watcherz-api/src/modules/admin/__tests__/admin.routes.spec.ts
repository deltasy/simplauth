import { test, expect, describe } from "vitest"
import request from "supertest"

import app from "../../../server.js"

import { extractTokens } from "../../../shared/__tests__/http.helper.js"
import { routesMetadataV1 } from "../../../../../shared/src/routes/v1.metadata.js";

const { signInRoute, setCookieRoute, userDeleteRoute, userRestoreRoute } = routesMetadataV1;

import { adminUser, createTestUser, memberUser } from "../../../shared/__tests__/prisma.helper.js";
import { signCatch } from "../../auth/__tests__/auth.routes.spec.js";


describe("Pipeline: Set cookie", () => {
    const newValue = "teste"

    test("Cookie setado", async () => {
        // Login
        const loginResponse = await request(app).post(signInRoute.raw).send(adminUser);
        expect(loginResponse.status).toBe(200)

        const { accessToken, refreshToken } = extractTokens(loginResponse);

        const validAdminResponse = await request(app)
            .post(setCookieRoute.raw)
            .send({
                "cookie": newValue
            })
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(validAdminResponse.status).toBe(200)
        expect(extractTokens(validAdminResponse)["refreshToken"]).toBe(newValue)
    });

    test("Permissões insuficientes", async () => {
        // Login
        const loginResponse = await request(app).post(signInRoute.raw).send(memberUser);
        expect(loginResponse.status).toBe(200);

        const { accessToken, refreshToken } = extractTokens(loginResponse);

        const invalidAdminResponse = await request(app)
            .post(setCookieRoute.raw)
            .send({
                "cookie": newValue
            })
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(invalidAdminResponse.status).toBe(403);
    });
});

describe("Pipeline: Restaurar usuário", () => {
    test("Usuário restaurado", async () => {

        // Deletar
        const deletedUser = await createTestUser();
        const { accessToken: aTokenMember, refreshToken: rTokenMember }
            = await signCatch("sign-in", deletedUser);

        const deleteResponse = await request(app).delete(userDeleteRoute.raw)
            .send({ delete: "confirmar" }).withAuth(aTokenMember, rTokenMember);
        expect(deleteResponse.status).toBe(200);

        const { response: signInTryResponse } = await signCatch("sign-in", deletedUser);
        expect(signInTryResponse.status).toBe(401);

        // Restaurar
        const { accessToken: aTokenAdmin, refreshToken: rTokenAdmin }
            = await signCatch("sign-in", adminUser);

        const restoreResponse = await request(app).post(userRestoreRoute.raw)
            .send({
                username: deletedUser.username
            }).withAuth(aTokenAdmin, rTokenAdmin);

        expect(restoreResponse.status).toBe(200);

        const { response } = await signCatch("sign-in", deletedUser);
        expect(response.status).toBe(200);
    });

    test("Permissões insuficientes", async () => {
        const { accessToken, refreshToken } = await signCatch("sign-in", memberUser);

        const invalidAdminResponse = await request(app)
            .post(setCookieRoute.raw)
            .send({ "username": "X" }).withAuth(accessToken, refreshToken);

        expect(invalidAdminResponse.status).toBe(403);
    });
});