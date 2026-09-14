import express from "express"
import { setCookie } from ".//debug.controller.js";
import { auth } from "../../../shared/middleware/auth.middleware.js";
import { checkPermission } from "./middlewares/debug.middleware.js";
import { Permission } from "@prisma/client";

export const debugRouterV1 = express.Router();

debugRouterV1.post('/set_cookie', auth, checkPermission(Permission.ADMIN), setCookie);
