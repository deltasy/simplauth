import express from "express"
import { getData, tokenRenewal, signIn, signUp, viewProfile, logout } from "./user.controller.js";


import { userSchema } from "../user.schema.js";
import { validate } from "../../../shared/validate/generic.validate.js";

import { auth, checkProfileOwnership } from "../../../shared/middleware/auth.middleware.js";
import { assertRefreshToken } from "./middlewares/refreshToken.controller.js";

export const userRouterV1 = express.Router();

userRouterV1.post('/sign-up', validate(userSchema), signUp)
userRouterV1.post('/sign-in', validate(userSchema), signIn)


userRouterV1.get('/refresh', assertRefreshToken, tokenRenewal)

userRouterV1.post('/logout', auth, assertRefreshToken, logout)
userRouterV1.get('/this', auth, getData)

userRouterV1.get('/:profile_name', checkProfileOwnership, viewProfile)