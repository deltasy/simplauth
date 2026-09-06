import type { NextFunction, Request, Response } from "express"
import { createUser, fetchUser, fetchUserRestrict, verifyPassword } from "../services/user.service.js"

export const getData = async (req: Request, res: Response, next: NextFunction) => {
    const data = await fetchUser({id: req.userId!})
    return res.status(200).json(data);
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

export const signUp = async (req: Request, res: Response) => {
    const data = await createUser(req.body)
    return res.status(201).json(data);
}

export const signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const data = await verifyPassword(email, password);
    if(!data){
        return res.status(403).json({error: "E-mail inválido"})
    }
        
    return res.status(200).json(data);
}