import axios, { AxiosError } from "axios";
import { api, standartURL } from "./api";
import { getToken, setToken } from "./setupInterceptors";

import { routesMetadataV1 } from "../../../shared/src/routes/v1.metadata";

const { 
    signInRoute, signUpRoute, logoutRoute, refreshRoute 
} = routesMetadataV1;

export const signIn = async (email: string, password: string) => {
    try {
        const response = await api.post(signInRoute.raw, {
            email: email,
            password: password
        });
        const { token } = response.data
        setToken(token);

    } catch (error) {
        throw error;
    }
};

export const signUp = async (email: string, password: string) => {
    try {
        const response = await api.post(signUpRoute.raw, {
            email: email,
            password: password
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await api.post(
            logoutRoute.raw,
            {},
            { withCredentials: true } 
        );
        return response.data;

    } catch (error) {
        if(error instanceof AxiosError && error.response){
            throw error.response.data;
        }
    }
};

export async function restoreSession() {
    if (getToken()) {
        return; // Já está autenticado
    }

    try {
        const { data } = await axios.get(
            standartURL + refreshRoute.raw,
            { withCredentials: true }
        );
        setToken(data.access_token);

    } catch (err) {
        throw err;
    }
}
