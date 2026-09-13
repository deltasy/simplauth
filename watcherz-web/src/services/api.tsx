import axios from "axios";

export const baseUrl = 'http://localhost:3000'

export const api = axios.create({
  baseURL: baseUrl, 
  withCredentials: true 
});
