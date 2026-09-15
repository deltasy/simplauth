import express from "express"

import { routesMetadataV1 } from "./v1.metadata.js";
import userRouterV1 from "../../modules/users/v1/user.routes.js";
import debugRouterV1 from "../../modules/debug/v1/debug.routes.js";
import authRouterV1 from "../../modules/auth/v1/auth.routes.js";

const routerV1 = express.Router();
routerV1.use(routesMetadataV1.usersPrefix, userRouterV1);
routerV1.use(routesMetadataV1.debugPrefix, debugRouterV1);
routerV1.use(routesMetadataV1.authPrefix, authRouterV1);

const versionV1 = {
    router: routerV1,
    metadata: routesMetadataV1
};

export default versionV1;