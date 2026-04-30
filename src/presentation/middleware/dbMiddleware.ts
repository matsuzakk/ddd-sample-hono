import type { MiddlewareHandler } from "hono";
import type { AppDatabase } from "../../infrastructure/database/db.js";
import { getDatabase } from "../../infrastructure/database/db.js";
import type { AppVariables } from "../../env.js";

/**
 * Attaches Drizzle `db` to Hono context: `c.get("db")`.
 */
export const createDbMiddleware = (
  resolveDb: () => AppDatabase,
): MiddlewareHandler<{
  Variables: AppVariables;
}> => {
  return async (c, next) => {
    c.set("db", resolveDb());
    await next();
  };
};

/**
 * Default: shared app DB from `getDatabase()`.
 */
export const dbMiddleware = createDbMiddleware(() => getDatabase().db);
