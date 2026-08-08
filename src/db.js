import { neon } from "@neondatabase/serverless";

const dbUrl = import.meta.env.VITE_NEON_DB_URL || import.meta.env.NEON_DB_URL;

if (!dbUrl) {
  console.warn("NEON_DB_URL ou VITE_NEON_DB_URL não definida nas variáveis de ambiente.");
}

export const sql = neon(dbUrl);
