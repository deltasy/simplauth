import { useEffect, useState } from "react";
import { api } from "./api";


type Permission = 'MEMBER' | 'ADMIN'

export interface User {
    createdAt: string,
    email: string,
    
    permission: Permission
    username: string | null
}

export const getUserData = async (): Promise<User> => {
    try{
        const response = await api.get(
            '/user/this'
        );
        return response.data;

    }catch(err){
        throw err;
    }

}
