import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname)

config({ 
    path: path.resolve(__dirname, "../../.env") 
});

export const {
    ENV_TYPE,
    DATABASE_URL,
    URL,
    PORT,
    JWT_SECRET,
    JWT_ATOKEN_EXPIRES_IN,
    JWT_RTOKEN_EXPIRES_IN
} = process.env;

export const JWT_RTOKEN_EXPIRES_MS = Number(process.env.JWT_RTOKEN_EXPIRES_MS);