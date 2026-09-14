import request from "supertest"

import { extractTokens } from "../../../shared/__tests__/http.helper.js"

import { test, expect, describe } from "vitest"

import app, { routeData } from "../../../server.js"

const debugRoute = routeData.debugUrl
const signInRoute = routeData.signInRoute

describe("Pipeline: Debug", () => {
    const pipelineRoute = debugRoute + "/set_cookie";
    const newValue = "teste"

    test("Set-cookie bem-sucedido (ADMIN)", async () => {
        // Login
        const loginResponse = await request(app).post(signInRoute).send({
            "email": "admin@gmail.com",
            "password": "12345"
        });
        expect(loginResponse.status).toBe(200)

        const { accessToken, refreshToken } = extractTokens(loginResponse);

        const validDebugResponse = await request(app)
            .post(pipelineRoute)
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
        const loginResponse = await request(app).post(signInRoute).send({
            "email": "member@gmail.com",
            "password": "12345"
        });
        expect(loginResponse.status).toBe(200);

        const { accessToken, refreshToken } = extractTokens(loginResponse);

        const invalidDebugResponse = await request(app)
            .post(pipelineRoute)
            .send({
                "cookie": newValue
            })
            .set('Cookie', `refreshToken=${refreshToken}`)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(invalidDebugResponse.status).toBe(403);
    });
});
