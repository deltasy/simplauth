import express from "express"

import { auth, optionalAuth } from "../../../shared/middlewares/auth.middleware.js";
import { editUserData, getUserData, viewProfile } from "./user.controller.js";

import { validate } from "../../../shared/validate/generic.validate.js";
import { editProfileSchema } from "../user.schema.js";

import { routesMetadataV1 } from "../../../shared/routes/v1.metadata.js";

const { myUserRoute, userProfileRoute, userEditRoute } = routesMetadataV1;

const userRouterV1 = express.Router();


userRouterV1.get(
    myUserRoute.relative,
    auth,
    getUserData
);
userRouterV1.get(
    `${userProfileRoute.relative}:profile_name`,
    optionalAuth, 
    viewProfile
);

userRouterV1.put(
    userEditRoute.relative,
    auth, validate(editProfileSchema),
    editUserData
);

export default userRouterV1;