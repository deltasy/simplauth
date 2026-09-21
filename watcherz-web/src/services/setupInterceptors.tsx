import axios from "axios";
import type { InternalAxiosRequestConfig, AxiosError } from "axios";

import { api, standartURL } from "./api"; // Sua instância base

import { routesMetadataV1 } from "../../../shared/src/routes/v1.metadata";

const { 
    refreshRoute 
} = routesMetadataV1;

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface PromiseQueueItem {
  resolve: (value: string | null) => void;
  reject: (reason?: any) => void;
}

let accessToken: string | null = null;

export function setToken(token: string | null) {
  accessToken = token;
}

export function getToken() {
  return accessToken;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing: boolean = false;
let failedQueue: PromiseQueueItem[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if(!error.response) return;

    const { error: errorMessage } = error.response.data as any || '';

    if(errorMessage && errorMessage.toLowerCase().includes("credenciais")) return Promise.reject(error);

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        if(error.response)

      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.get(
          standartURL + refreshRoute.raw,
          { withCredentials: true } 
        );

        const newToken: string = data.token;
        setToken(newToken);
        
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        setToken(null);

        window.location.href = "/login";
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;

      }
    }

    return Promise.reject(error);
  }
);