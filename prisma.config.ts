import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Triggers dotenvx to decrypt .env.local — no override so it doesn't clobber decrypted values
config({ path: ".env.local" });

const migrationUrl = process.env["DATABASE_URL_UNPOOLED"] || process.env["DATABASE_URL"];

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl,
  },
});
