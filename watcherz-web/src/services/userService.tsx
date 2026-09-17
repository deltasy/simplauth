import { api } from "./api";

import { routesMetadataV1 } from "../../../shared/src/routes/v1.metadata";


const { 
    myUserRoute
} = routesMetadataV1;

type Permission = 'MEMBER' | 'ADMIN'

export interface User {
    createdAt: string,
    email: string,
    
    permission: Permission
    username: string | null
}

export const getUserData = async (): Promise<User> => {
    try{
        const response = await api.get(myUserRoute.raw);
        return response.data;

    }catch(err){
        throw err;
    }

}
