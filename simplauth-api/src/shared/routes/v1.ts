import express from "express"

import { routesMetadataV1 } from "@simplauth/shared";

import userRouterV1 from "#users/v1/user.routes.js";
import adminRouterV1 from "#admin/v1/admin.routes.js";
import authRouterV1 from "#auth/v1/auth.routes.js";

const routerV1 = express.Router();
routerV1.use(routesMetadataV1.usersPrefix, userRouterV1);
routerV1.use(routesMetadataV1.adminPrefix, adminRouterV1);
routerV1.use(routesMetadataV1.authPrefix, authRouterV1);

const versionV1 = {
    router: routerV1,
    metadata: routesMetadataV1
};

export default versionV1;