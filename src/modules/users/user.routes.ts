import express from "express"
import { getData, tokenRenewal, signIn, signUp, viewProfile, logout } from "./controllers/user.controller.js";
import { userSchema } from "./user.schema.js";
import { validate } from "../../shared/validate/generic.validate.js";
import { auth, checkProfileOwnership } from "../../shared/middleware/auth.middleware.js";
import { assertRefreshToken } from "./middlewares/refreshToken.controller.js";

export const userRouter = express.Router();

userRouter.post('/sign-up', validate(userSchema), signUp)
userRouter.post('/sign-in', validate(userSchema), signIn)


userRouter.get('/refresh', assertRefreshToken, tokenRenewal)

userRouter.post('/logout', auth, assertRefreshToken, logout)
userRouter.get('/this', auth, getData)

userRouter.get('/:profile_name', checkProfileOwnership, viewProfile)

