import express from "express"

import { auth, optionalAuth } from "../../../shared/middlewares/auth.middleware.js";
import { UserController } from "./user.controller.js";

import { validate } from "../../../shared/validate/generic.validate.js";
import { editProfileSchema } from "../user.schema.js";

import { routesMetadataV1 } from "../../../../../shared/routes/v1.metadata.js";
import { assertRefreshToken } from "../../auth/middlewares/refreshToken.middleware.js";

const { myUserRoute, userProfileRoute, userEditRoute, userDeleteRoute } = routesMetadataV1;

const userRouterV1 = express.Router();


userRouterV1.get(
    myUserRoute.relative,
    auth,
    UserController.fetchCurrentUser
);
userRouterV1.get(
    `${userProfileRoute.relative}:profile_name`,
    optionalAuth,
    UserController.fetchUserProfile
);

// Para operações "críticas" de update e delete, se verifica o refreshToken

userRouterV1.put(
    userEditRoute.relative,
    assertRefreshToken, validate(editProfileSchema),
    UserController.editCurrentUser
);

userRouterV1.delete(
    userDeleteRoute.relative,
    assertRefreshToken,
    UserController.deleteCurrentUser
);

export default userRouterV1;