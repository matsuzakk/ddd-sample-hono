import { getDatabase } from "../database/db.js";
/**
 * Attaches Drizzle `db` to Hono context: `c.get("db")`.
 */
export const dbMiddleware = async (c, next) => {
    const { db } = getDatabase();
    c.set("db", db);
    await next();
};
