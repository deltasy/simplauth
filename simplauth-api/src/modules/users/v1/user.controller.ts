import type { NextFunction, Request, Response } from "express"
import type { User } from "@prisma/client";

import { routesMetadataV1 } from "@simplauth/shared";

import { AuthService } from "#auth/auth.service.js";
import { ENV_TYPE } from "#config/env.js";
import { UserService } from "../user.service.js";
import { editProfileSchema } from "../user.schema.js";


export const UserController = {
    async fetchCurrentUser(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await UserService.fetchCurrentUser({ id: req.userId!, is_deleted: false });
            return res.status(200).json(data);

        } catch (error) {
            next(error);
        }
    },

    async fetchUserProfile(req: Request, res: Response, next: NextFunction) {
        const targetUserName = req.params["profile_name"] as string;

        try {
            const currentUser = await UserService.fetchCurrentUser({ id: req.userId!, is_deleted: false }) as User;

            const data = await (
                targetUserName === currentUser.username ?
                    currentUser :
                    UserService.fetchUserProfile({ username: targetUserName, is_deleted: false })
            );

            if (!data) {
                return res.status(404).send({ error: "This user does not exist" });
            }

            return res.status(200).json(data);

        } catch (error) {
            next(error);
        }
    },

    
    async verifyAttribute(req: Request, res: Response, next: NextFunction) {
        try {
            if(!req.query) return res.status(422).json({error: "Attributes not specified"});

            const { username, email } = editProfileSchema.parse(req.query);

            if(username === "" || email === "") return res.status(422).json({error: "Attributes not specified"});

            if(username){
                const data = await UserService.fetchUser({ username: username });
                if(!data) return res.status(200).json({message: "Available!"});

            }
            
            if(email){
                const data = await UserService.fetchUser({ email: email })
                if(!data) return res.status(200).json({message: "Available!"});
            }



            return res.status(409).json({ error: "Already exists" });

        } catch (error) {
            next(error);
        }
    },

    async editCurrentUser(req: Request, res: Response, next: NextFunction) {
        try {
            await UserService.editCurrentUser(req.userId!, req.body);
            return res.status(200).json({ message: "Fields changed successfully" });

        } catch (error) {
            next(error);
        }
    },

    async deleteCurrentUser(req: Request, res: Response, next: NextFunction) {
        try {
            // Revoke refresh token
            const token = req.cookies?.refreshToken;
            await AuthService.revokeRefreshToken(token);
            res.cookie("refreshToken", '', {
                httpOnly: true,
                path: routesMetadataV1.baseUrl,
                secure: ENV_TYPE === "production",
                sameSite: "strict",
                expires: new Date(0)
            });

            await UserService.deleteCurrentUser(req.userId!);
            return res.status(200).json({ message: "Account deleted successfully" });

        } catch (error) {
            next(error);
        }
    },
};