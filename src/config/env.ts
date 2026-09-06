import { config } from "dotenv"

config({path: `.env`})

export const {
    DATABASE_URL,
    PORT,
    JWT_SECRET,
    JWT_EXPIRES_IN
} = process.env;