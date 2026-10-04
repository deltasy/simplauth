import { app } from "#server"
import { describe, test, expect } from "vitest"

import request from "supertest"

import { routesMetadataV1 } from "@simplauth/shared";

import { JWT_SECRET } from "#config/env.js"

import jwt, { type JwtPayload } from "jsonwebtoken"
import { Permission } from "@prisma/client"
import { randomUUID } from "node:crypto"

import { extractTokens } from "#shared/__tests__/http.helper.js"
import { memberUser, adminUser } from "#shared/__tests__/prisma.helper.js"
import type { signRequest } from "../auth.schema.js"
import "#shared/__tests__/utils.js"


const { refreshRoute, signInRoute, signUpRoute, logoutRoute } = routesMetadataV1;

describe("Pipeline: /sign-up", () => {


    test("OK", async () => {
        const newUserEmail = `test-${randomUUID()}@gmail.com`

        const { response } = await signCatch("sign-up", {
            "email": newUserEmail,
            "password": "12345"
        });
        expect(response.status).toBe(201); // CREATED

        const { id: userId, token: accessToken } = response.body;
        const validToken = jwt.verify(accessToken, JWT_SECRET as jwt.Secret) as JwtPayload;

        expect(validToken.userId).toBe(userId); // Valid token
    })


    test("Duplicate registration", async () => {
        const newUserEmail = `test-${randomUUID()}@gmail.com`

        await signCatch("sign-up", {
            "email": newUserEmail,
            "password": "12345"
        });
        const { response } = await signCatch("sign-up", {
            "email": newUserEmail,
            "password": "12345"
        });
        expect(response.status).toBe(409); // CONFLICT
    })


    test("Invalid request", async () => {
        // Invalid email
        const { response: invalidEmailResponse } = await signCatch("sign-up", {
            "email": "email",
            "password": memberUser.password
        });
        expect(invalidEmailResponse.status).toBe(422);

        const { response: invalidPasswordResponse } = await signCatch("sign-up", {
            "email": memberUser.email,
            "password": "1"
        });
        expect(invalidPasswordResponse.status).toBe(422);
    });
})

describe("Pipeline: /sign-in", () => {
    test("OK", async () => {
        const { response, accessToken, refreshToken } = await signCatch("sign-in", memberUser);
        expect(response.status).toBe(200);

        const validAccessToken = jwt.verify(accessToken, JWT_SECRET as jwt.Secret) as JwtPayload;
        expect(validAccessToken).toBeDefined();
        expect(validAccessToken.jti).toBeUndefined(); // undefined jti
        expect(validAccessToken.permission).toBeUndefined(); // The user is not admin, so there is no "permission" field in the payload

        const validRefreshToken = jwt.verify(refreshToken, JWT_SECRET as jwt.Secret) as JwtPayload;
        expect(validRefreshToken).toBeDefined();
        expect(validRefreshToken.jti).toBeDefined(); // defined jti (exclusive to refresh tokens)
    })

    test("OK (ADMIN)", async () => {
        const { response, accessToken } = await signCatch("sign-in", adminUser);
        expect(response.status).toBe(200);

        const validAccessToken = jwt.verify(accessToken, JWT_SECRET as jwt.Secret) as JwtPayload;
        expect(validAccessToken.permission).toBe(Permission.ADMIN); // The user is admin, so the "permission" field exists
    })

    test("Invalid", async () => {
        const { response } = await signCatch("sign-in", {
            "email": "not_registered@gmail.com",
            "password": "12345"
        });;
        expect(response.status).toBe(401); // UNAUTHORIZED
    })
})

describe("Pipeline: /refresh", () => {
    test("OK", async () => {
        // Login
        const { accessToken: AToken1, refreshToken: RToken1 } = await signCatch("sign-in", memberUser);

        // 1st Token rotation
        const refreshResponse1 = await request(app)
            .get(refreshRoute.raw).withAuth(AToken1, RToken1);

        expect(refreshResponse1.status).toBe(200);


        const { accessToken: AToken2, refreshToken: RToken2 } = extractTokens(refreshResponse1);

        // 2nd Token rotation
        const refreshResponse2 = await request(app)
            .get(refreshRoute.raw).withAuth(AToken2, RToken2);

        expect(refreshResponse2.status).toBe(200);
    });

    test("Token reuse", async () => {
        // Login
        const { accessToken: AToken1, refreshToken: RToken1 } = await signCatch("sign-in", memberUser);

        // Token rotation
        const validRefreshResponse = await request(app)
            .get(refreshRoute.raw).withAuth(AToken1, RToken1);

        const { accessToken: AToken2, refreshToken: RToken2 } = extractTokens(validRefreshResponse);

        // Token reuse (malicious user)
        const attackResponse = await request(app)
            .get(refreshRoute.raw).withAuth(AToken1, RToken1);

        expect(attackResponse.status).toBe(403);

        // 2nd Token rotation (Will fail. For security reasons, the legitimate user is also disconnected)
        const victimResponse = await request(app)
            .get(refreshRoute.raw).withAuth(AToken2, RToken2);

        expect(victimResponse.status).toBe(403);
    });
});

describe("Pipeline: /logout", () => {
    test("OK", async () => {
        const { accessToken, refreshToken } = await signCatch('sign-in', memberUser);

        const logoutResponse = await request(app)
            .post(logoutRoute.raw).withAuth(accessToken, refreshToken);

        expect(logoutResponse.status).toBe(200);

        // Token refresh attempt (Will be invalid, since when the user logs out, the refreshToken is burned)
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
