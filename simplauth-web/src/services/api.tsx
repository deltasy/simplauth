import axios from "axios";

export const standartURL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: standartURL,
  withCredentials: true 
});
