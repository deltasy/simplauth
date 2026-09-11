import "dotenv/config";
import { defineConfig } from "prisma/config";
import { DATABASE_URL } from "./src/config/env.js";

// DATABASE_URL com fallback
const FINAL_DB_URL = DATABASE_URL || "postgresql://dummy:dummy@dummy:5432/dummy"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: FINAL_DB_URL,
  },
});
