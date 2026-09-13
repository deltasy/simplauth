import axios, { AxiosError } from "axios";
import { api, baseUrl } from "./api";
import { getToken, setToken } from "./setupInterceptors";
import { useNavigate } from "react-router-dom";

export const signIn = async (email: string, password: string) => {
    try {
        const response = await api.post("/user/sign-in", {
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
        const response = await api.post("/user/sign-up", {
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
            "/user/logout",
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
            baseUrl + "/user/refresh",
            { withCredentials: true }
        );
        setToken(data.access_token);

    } catch (err) {
        throw err;
    }
}
