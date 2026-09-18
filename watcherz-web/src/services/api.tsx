import axios from "axios";

import { URL, PORT } from "../../../shared/config/env.js"

export const standartURL = `${URL}:${PORT}`;

export const api = axios.create({
  baseURL: standartURL,
  withCredentials: true 
});
