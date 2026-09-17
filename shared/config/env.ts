import { config } from "dotenv"

// pegará o .env mais próximo
config({ quiet: false});

export const {
    ENV_TYPE,
    DATABASE_URL,
    PORT,
    JWT_SECRET,
    JWT_ATOKEN_EXPIRES_IN,
    JWT_RTOKEN_EXPIRES_IN
} = process.env;

export const JWT_RTOKEN_EXPIRES_MS = Number(process.env.JWT_RTOKEN_EXPIRES_MS);