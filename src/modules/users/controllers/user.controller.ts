import type { NextFunction, Request, Response } from "express"
import { createUser, fetchUser, fetchUserRestrict, verifyPassword, renewTokens } from "../services/user.service.js"
import { 
    JWT_SECRET,
    ENV_TYPE,
    JWT_RTOKEN_EXPIRES_MS

} from "../../../config/env.js";

import jwt from "jsonwebtoken";

export const getData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await fetchUser({id: req.userId!});
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

export const viewProfile = async (req: Request, res: Response, next: NextFunction) => {
    const targetUserName = req.params["profile_name"] as string;

    try{
        const currentUser = req.userId ? await fetchUser({id: req.userId}) : null

        const data = await (
            targetUserName === currentUser?.username ? 
            fetchUser({username: targetUserName}) :
            fetchUserRestrict({username: targetUserName})
        )

        if(!data){
            return res.status(404).send({error: "Esse usuário não existe"})
        }

        return res.status(200).json(data);

    }catch(error){
        next(error);
    }
    

}

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await createUser(req.body);
        return res.status(201).json(data);

    } catch (error) {
        next(error);
    }
}

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const user = await verifyPassword(email, password);
        if(!user){
            return res.status(401).json({error: "Credenciais inválidas"})
        }

        const { accessToken, refreshToken } = await renewTokens(user.id)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            path: '/',
            secure: ENV_TYPE === "production",
            sameSite: "strict",
            maxAge: JWT_RTOKEN_EXPIRES_MS
        })

        return res.status(200).json({token: accessToken})

    } catch (error) {
        next(error);
    }
}

export const tokenRenewal = async (req: Request, res: Response, next: NextFunction) => {
    try{
        if(!(req.cookies && req.cookies.refreshToken)){
            return res.status(401).json({error: "Token inválido ou expirado"})
        }

        const token = req.cookies.refreshToken as string;
        
        const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as jwt.JwtPayload
        const { accessToken, refreshToken } = await renewTokens(decoded.userId, token)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            path: '/',
            secure: ENV_TYPE === "production",
            sameSite: "strict",
            maxAge: JWT_RTOKEN_EXPIRES_MS
        })

        return res.status(200).json({token: accessToken})

    }catch(error){
        next(error)
    }
}