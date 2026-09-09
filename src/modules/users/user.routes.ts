import express from "express"
import { getData, tokenRenewal, signIn, signUp, viewProfile } from "./controllers/user.controller.js";
import { userSchema } from "./user.schema.js";
import { validate } from "../../shared/validate/generic.validate.js";
import { auth, checkProfileOwnership } from "../../shared/middleware/auth.middleware.js";

export const userRouter = express.Router();

userRouter.post('/sign-up', validate(userSchema), signUp)
userRouter.post('/sign-in', validate(userSchema), signIn)

userRouter.get('/refresh', tokenRenewal)

userRouter.get('/this', auth, getData)

userRouter.get('/:profile_name', checkProfileOwnership, viewProfile)

