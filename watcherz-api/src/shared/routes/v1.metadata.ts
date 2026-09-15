import { defineRoute } from "./utils/defineRoute.js";

const baseUrl = "/api/v1";

// Afixos
const authPrefix = "/auth";
const usersPrefix = "/users";
const debugPrefix = "/debug";

// URLS
const authUrl = baseUrl + authPrefix;
const usersUrl = baseUrl + usersPrefix;
const debugUrl = baseUrl + debugPrefix;

export const routesMetadataV1 = Object.freeze({
    baseUrl,
    authPrefix,
    usersPrefix,
    debugPrefix,

    authUrl,
    usersUrl,
    debugUrl,

    refreshRoute: defineRoute(authUrl, authPrefix, '/refresh'), 
    signInRoute: defineRoute(authUrl, authPrefix, '/sign-in'),
    signUpRoute: defineRoute(authUrl, authPrefix, '/sign-up'),
    logoutRoute: defineRoute(authUrl, authPrefix, '/logout'),

    myUserRoute: defineRoute(usersUrl, usersPrefix, '/me'),
    userEditRoute: defineRoute(usersUrl, usersPrefix, '/me/edit'),
    
    userProfileRoute: defineRoute(usersUrl, usersPrefix, '/'),

    setCookieRoute: defineRoute(debugUrl, debugPrefix, '/set_cookie')
});