import express from "express";

import { validate } from "../../../shared/validate/generic.validate.js";
import { signRequestSchema } from "../auth.schema.js";

import { assertRefreshToken } from "../middlewares/refreshToken.middleware.js";

import { AuthController } from "./auth.controller.js";
import { routesMetadataV1 } from "../../../../../shared/routes/v1.metadata.js";


const authRouterV1 = express.Router();
const { signUpRoute, signInRoute, refreshRoute, logoutRoute } = routesMetadataV1;

authRouterV1.post(signUpRoute.relative,
    validate(signRequestSchema), AuthController.signUp);

authRouterV1.post(signInRoute.relative,
    validate(signRequestSchema), AuthController.signIn);

authRouterV1.post(logoutRoute.relative,
    AuthController.logout);

authRouterV1.get(refreshRoute.relative,
    assertRefreshToken, AuthController.renewTokens);

export default authRouterV1;