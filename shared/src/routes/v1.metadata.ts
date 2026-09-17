import { defineRoute } from "./utils/defineRoute.js";

const baseUrl = "/api/v1";

// Afixos
const authPrefix = "/auth";
const usersPrefix = "/users";
const adminPrefix = "/admin";

// URLS
const authUrl = baseUrl + authPrefix;
const usersUrl = baseUrl + usersPrefix;
const adminUrl = baseUrl + adminPrefix;

export const routesMetadataV1 = Object.freeze({
    baseUrl,
    authPrefix,
    usersPrefix,
    adminPrefix,

    authUrl,
    usersUrl,
    adminUrl,

    refreshRoute: defineRoute(authUrl, authPrefix, '/refresh'), 
    signInRoute: defineRoute(authUrl, authPrefix, '/sign-in'),
    signUpRoute: defineRoute(authUrl, authPrefix, '/sign-up'),
    logoutRoute: defineRoute(authUrl, authPrefix, '/logout'),

    myUserRoute: defineRoute(usersUrl, usersPrefix, '/me'),
    userEditRoute: defineRoute(usersUrl, usersPrefix, '/me/edit'),
    userDeleteRoute: defineRoute(usersUrl, usersPrefix, '/me/delete'),

    userProfileRoute: defineRoute(usersUrl, usersPrefix, '/'),

    setCookieRoute: defineRoute(adminUrl, adminPrefix, '/set_cookie'),
    userRestoreRoute: defineRoute(adminUrl, adminPrefix, '/user_restore/'),
});