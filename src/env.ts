import type { AppDatabase } from "./infrastructure/database/db.js";

export type AppVariables = {
  db: AppDatabase;
  sessionUserId?: number;
};
