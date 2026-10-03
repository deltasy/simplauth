import {
  defineRoute
} from "./chunk-4AGNO6RV.js";

// src/routes/v1.metadata.ts
var baseUrl = "/api/v1";
var authPrefix = "/auth";
var usersPrefix = "/users";
var adminPrefix = "/admin";
var authUrl = baseUrl + authPrefix;
var usersUrl = baseUrl + usersPrefix;
var adminUrl = baseUrl + adminPrefix;
var routesMetadataV1 = Object.freeze({
  baseUrl,
  authPrefix,
  usersPrefix,
  adminPrefix,
  authUrl,
  usersUrl,
  adminUrl,
  refreshRoute: defineRoute(authUrl, authPrefix, "/refresh"),
  signInRoute: defineRoute(authUrl, authPrefix, "/sign-in"),
  signUpRoute: defineRoute(authUrl, authPrefix, "/sign-up"),
  logoutRoute: defineRoute(authUrl, authPrefix, "/logout"),
  checkAttRoute: defineRoute(usersUrl, usersPrefix, "/check"),
  myUserRoute: defineRoute(usersUrl, usersPrefix, "/me"),
  userEditRoute: defineRoute(usersUrl, usersPrefix, "/me/edit"),
  userDeleteRoute: defineRoute(usersUrl, usersPrefix, "/me/delete"),
  userProfileRoute: defineRoute(usersUrl, usersPrefix, "/"),
  setCookieRoute: defineRoute(adminUrl, adminPrefix, "/set_cookie"),
  userRestoreRoute: defineRoute(adminUrl, adminPrefix, "/user_restore/")
});

export {
  routesMetadataV1
};
