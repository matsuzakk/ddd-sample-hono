import type { MiddlewareHandler } from "hono";
import type { AppDatabase } from "../../infrastructure/database/db.js";
import { getDatabase } from "../../infrastructure/database/db.js";

export type DbVariables = {
  db: AppDatabase;
};

/**
 * Attaches Drizzle `db` to Hono context: `c.get("db")`.
 */
export const dbMiddleware: MiddlewareHandler<{
  Variables: DbVariables;
}> = async (c, next) => {
  const { db } = getDatabase();
  c.set("db", db);
  await next();
};
