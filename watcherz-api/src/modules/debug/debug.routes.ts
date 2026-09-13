import express from "express"
import { setCookie } from "./debug.controller.js";
import { auth } from "../../shared/middleware/auth.middleware.js";
import { checkPermission } from "./debug.middleware.js";
import { Permission } from "@prisma/client";

export const debugRouter = express.Router();

debugRouter.post('/set_cookie', auth, checkPermission(Permission.ADMIN), setCookie)
