import express from "express"
import { Permission } from "@prisma/client";

import { setCookie } from "./debug.controller.js";
import { auth } from "../../../shared/middlewares/auth.middleware.js";
import { checkPermission } from "./middlewares/debug.middleware.js";
import { routesMetadataV1 } from "../../../shared/routes/v1.metadata.js";

const debugRouterV1 = express.Router();
const { setCookieRoute } = routesMetadataV1;

debugRouterV1.post(
    setCookieRoute.relative,
    auth, checkPermission(Permission.ADMIN),
    setCookie
);

export default debugRouterV1;
