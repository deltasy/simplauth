import type { NextFunction, Request, Response } from "express"
import { ENV_TYPE, JWT_RTOKEN_EXPIRES_MS } from "../../config/env.js"

export const setCookie = async (req: Request, res: Response, next: NextFunction) => {
    const { cookie } = req.body

    res.cookie("refreshToken", cookie, {
        httpOnly: true,
        path: '/',
        secure: ENV_TYPE === "production",
        sameSite: "strict",
        maxAge: JWT_RTOKEN_EXPIRES_MS
    })

    res.status(200).send({debug: "Cookie setado"})
}