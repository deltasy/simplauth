import { api } from "./api";

import { routesMetadataV1 } from "../../../shared/src/routes/v1.metadata";


const { 
    myUserRoute,
    checkAttRoute,
    userEditRoute
} = routesMetadataV1;

type Permission = 'MEMBER' | 'ADMIN'

export interface User {
    createdAt: string,
    email: string,
    
    permission: Permission
    username: string | null
}

export const checkField = async (field: string, value: string): Promise<boolean> => {
    try{
        const response = await api.get(checkAttRoute.raw + `?${field}=${value}`);
        return response.data;

    }catch(err){
        throw err;
    }
}

export const editField = async (field: string, value: string): Promise<boolean> => {
    try{
        console.log(field)
        const response = await api.put(userEditRoute.raw, 
            {
                [field]: value
            },
            { withCredentials: true } 
        );
        
        console.log(`RESPONSE ${field} ${value}:`, response)
        return response.data;

    }catch(err){
        throw err;
    }
}

export const getUserData = async (): Promise<User> => {
    try{
        const response = await api.get(myUserRoute.raw);
        return response.data;

    }catch(err){
        throw err;
    }

}
