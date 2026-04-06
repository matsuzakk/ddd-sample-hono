import { defineConfig } from "drizzle-kit";

const sqlitePath = process.env.SQLITE_PATH ?? "./data/app.db";

export default defineConfig({
  schema: "./src/infrastructure/database/schema.ts",
  out: "./src/infrastructure/database/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: sqlitePath,
  },
});
