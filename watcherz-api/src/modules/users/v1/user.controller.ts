import type { NextFunction, Request, Response } from "express"
import { fetchUser, fetchUserFull, fetchMyUser, editUser } from "../user.service.js"

export const getUserData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await fetchMyUser({ id: req.userId! });
        return res.status(200).json(data);

    } catch (error) {
        next(error);
    }
}

export const editUserData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.userId) return;
        await editUser({ id: req.userId }, req.body);
        return res.status(200).json({ message: "Campos alterados com sucesso"});

    } catch (error) {
        next(error);
    }
}

export const viewProfile = async (req: Request, res: Response, next: NextFunction) => {
    const targetUserName = req.params["profile_name"] as string;

    try {
        const currentUser = req.userId ? await fetchUserFull({ id: req.userId }) : null

        const data = await (
            targetUserName === currentUser?.username ?
                fetchMyUser({ username: targetUserName }) :
                fetchUser({ username: targetUserName })
        )

        if (!data) {
            return res.status(404).send({ error: "Esse usuário não existe" })
        }

        return res.status(200).json(data);

    } catch (error) {
        next(error);
    }


}

