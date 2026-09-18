import z from "zod";
import {
    ENV_TYPE,
    DATABASE_URL, 
    URL,
    PORT,
    JWT_SECRET,
    JWT_ATOKEN_EXPIRES_IN, JWT_RTOKEN_EXPIRES_IN, JWT_RTOKEN_EXPIRES_MS
} from "../../../../shared/config/env.js";

const envReady = z.object({
    ENV_TYPE: z.string(),
    PORT: z.string(), DATABASE_URL: z.string(),
    URL: z.string(),
    JWT_SECRET: z.string(),
    JWT_ATOKEN_EXPIRES_IN: z.string(),
    JWT_RTOKEN_EXPIRES_IN: z.string(),
    JWT_RTOKEN_EXPIRES_MS: z.number()
})

export const assertEnvironment = () => {
    try {
        envReady.parse({
            ENV_TYPE: ENV_TYPE,
            DATABASE_URL: DATABASE_URL, 
            URL: URL,
            PORT: PORT, 
            JWT_SECRET: JWT_SECRET,
            JWT_ATOKEN_EXPIRES_IN: JWT_ATOKEN_EXPIRES_IN,
            JWT_RTOKEN_EXPIRES_IN: JWT_RTOKEN_EXPIRES_IN,
            JWT_RTOKEN_EXPIRES_MS: JWT_RTOKEN_EXPIRES_MS
        });

    } catch (error) {
        console.log(error)
        process.exit(1);
    }
}