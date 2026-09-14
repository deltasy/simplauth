import express from "express"
import { userRouterV1 } from "../../modules/users/v1/user.routes.js";
import { debugRouterV1 } from "../../modules/debug/v1/debug.routes.js";

export const routerV1 = express.Router();


const baseUrl = "/api/v1"
const usersUrl = baseUrl + "/users"

export const routesMetadata = Object.freeze({
    baseUrl,
    usersUrl,
    debugUrl: baseUrl + "/debug",

    signInRoute: usersUrl + "/sign-in"
});

routerV1.use(routesMetadata.usersUrl, userRouterV1)
routerV1.use(routesMetadata.debugUrl, debugRouterV1)