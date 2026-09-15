import { test, expect, describe } from "vitest"
import request from "supertest"

import { extractTokens } from "../../../shared/__tests__/http.helper.js"
import app from "../../../server.js"
import { routesMetadataV1 } from "../../../shared/routes/v1.metadata.js";

const { signInRoute, setCookieRoute } = routesMetadataV1;

describe("Pipeline: Debug", () => {
    const newValue = "teste"

    test("Set-cookie bem-sucedido (ADMIN)", async () => {
        // Login
        const loginResponse = await request(app).post(signInRoute.raw).send({
            "email": "admin@gmail.com",
            "password": "12345"
        });
        expect(loginResponse.status).toBe(200)

        const { accessToken, refreshToken } = extractTokens(loginResponse);

        const validDebugResponse = await request(app)
            .post(setCookieRoute.raw)
            .send({
                "cookie": newValue
            })
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(validDebugResponse.status).toBe(200)
        expect(extractTokens(validDebugResponse)["refreshToken"]).toBe(newValue)
    });

    test("Set-cookie não autorizado", async () => {
        // Login
        const loginResponse = await request(app).post(signInRoute.raw).send({
            "email": "member@gmail.com",
            "password": "12345"
        });
        expect(loginResponse.status).toBe(200);

        const { accessToken, refreshToken } = extractTokens(loginResponse);

        const invalidDebugResponse = await request(app)
            .post(setCookieRoute.raw)
            .send({
                "cookie": newValue
            })
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(invalidDebugResponse.status).toBe(403);
    });
});
