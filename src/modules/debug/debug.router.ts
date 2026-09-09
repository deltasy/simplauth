import express from "express"
import { setCookie } from "./debug.controller.js";

export const debugRouter = express.Router();

debugRouter.post('/set_cookie', setCookie)
