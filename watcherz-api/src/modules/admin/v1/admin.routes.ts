import express from "express"
import { Permission } from "@prisma/client";

import { AdminController } from "./admin.controller.js";
import { auth } from "../../../shared/middlewares/auth.middleware.js";
import { checkPermission } from "./middlewares/admin.middleware.js";

import { routesMetadataV1 } from "../../../../../shared/src/routes/v1.metadata.js";


const adminRouterV1 = express.Router();
const { setCookieRoute, userRestoreRoute } = routesMetadataV1;

adminRouterV1.post(
    setCookieRoute.relative,
    auth, checkPermission(Permission.ADMIN),

    AdminController.setRefreshCookie
);

adminRouterV1.post(
    userRestoreRoute.relative,
    auth, checkPermission(Permission.ADMIN),
    AdminController.restoreDeletedUser
);

export default adminRouterV1;
