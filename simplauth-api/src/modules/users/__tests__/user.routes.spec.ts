import request from "supertest"
import { test, expect, describe } from "vitest"

import { routesMetadataV1 } from "@simplauth/shared";

import { app } from "#server"
import { memberUser, adminUser, createTestUser } from "#shared/__tests__/prisma.helper.js"
import { signCatch } from "#auth/__tests__/auth.routes.spec.js"
import "#shared/__tests__/utils.js"


const { myUserRoute, userProfileRoute, userEditRoute, checkAttRoute, userDeleteRoute } = routesMetadataV1;


describe("Pipeline: /me", () => {
    test("OK", async () => {
        const { accessToken } = await signCatch("sign-in", memberUser);

        const thisUserResponse = await request(app)
            .get(myUserRoute.raw).withAuth(accessToken);

        expect(thisUserResponse.status).toBe(200);
    })

    test("Invalid Access Token", async () => {
        const { accessToken } = await signCatch("sign-in", memberUser);

        // Valid token
        const validTokenResponse = await request(app)
            .get(myUserRoute.raw).withAuth(accessToken);

        expect(validTokenResponse.status).toBe(200)

        // Invalid token
        const invalidTokenResponse = await request(app)
            .get(myUserRoute.raw).withAuth("Bearer INVALID");

        expect(invalidTokenResponse.status).toBe(401)
    })

})

describe("Pipeline: /:profile_name", () => {
    test("OK (Visit own profile)", async () => {
        // When this happens, normally private information will be visible (because it is the user themselves)
        const profile = memberUser.username

        const { accessToken } = await signCatch("sign-in", memberUser);

        const response = await request(app)
            .get(userProfileRoute.raw + profile).withAuth(accessToken);

        expect(response.status).toBe(200);

        // "E-mail" appears for the user themselves
        expect(response.body.email).toBeDefined();
    })

    test("OK (Visit another profile)", async () => {
        const profile = adminUser.username

        const { accessToken } = await signCatch("sign-in", memberUser);

        const response = await request(app)
            .get(userProfileRoute.raw + profile).withAuth(accessToken);

        expect(response.status).toBe(200);

        // "E-mail" does not appear in the response
        expect(response.body.email).toBeUndefined();
    })

    test("Invalid", async () => {
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

        // Check if the field was changed
        const response = await request(app)
            .get(myUserRoute.raw).withAuth(accessToken);
        expect(response.body.username).toBe(newUsername);
    });

    test("Unavailable field", async () => {
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

    test("Invalid or missing refresh token", async () => {
        // Login
        const { accessToken } = await signCatch("sign-in", memberUser);

        // Delete account
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

        // Delete account
        const deleteResponse = await request(app)
            .delete(userDeleteRoute.raw).withAuth(accessToken, refreshToken);
        expect(deleteResponse.status).toBe(200);

        // Check if the profile no longer exists
        const { response } = await signCatch("sign-in", user);
        expect(response.status).toBe(401);
    });

    test("Invalid refresh token", async () => {
        // Login
        const { accessToken } = await signCatch("sign-in", memberUser);

        // Delete account
        const deleteResponse = await request(app)
            .get(userDeleteRoute.raw).withAuth(accessToken, "INVALID RTOKEN");
        expect(deleteResponse.status).toBe(404);
    });
})

describe("Pipeline: /check?attr=val", () => {
    test("OK", async () => {
        // Login
        const { accessToken } = await signCatch("sign-in", memberUser);

        // Check attribute
        const checkResponse = await request(app)
            .get(checkAttRoute.raw + "?username=uniqueUsername421").withAuth(accessToken);
        expect(checkResponse.status).toBe(200);
    });

    test("Attribute already exists", async () => {
        const { accessToken } = await signCatch("sign-in", memberUser);

        const checkResponse = await request(app)
            .get(checkAttRoute.raw + "?username=" + memberUser.username).withAuth(accessToken);
        expect(checkResponse.status).toBe(409);
    });

    test("Invalid attribute", async () => {
        const { accessToken } = await signCatch("sign-in", memberUser);

        const checkResponse = await request(app)
            .get(checkAttRoute.raw + "?invalid=value").withAuth(accessToken);
        expect(checkResponse.status).toBe(422);
    });

    test("Invalid session", async () => {
        const checkResponse = await request(app)
            .get(checkAttRoute.raw + "?username=uniqueUsername421").withAuth("INVALID ATOKEN");
        expect(checkResponse.status).toBe(401);
    });
})