import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
const defaultPath = "./data/app.db";
function resolveSqlitePath() {
    return process.env.SQLITE_PATH ?? defaultPath;
}
/**
 * Creates a SQLite connection and Drizzle ORM instance.
 * Callers are responsible for closing the client when the process shuts down.
 */
export const createDatabase = (sqlitePath = resolveSqlitePath()) => {
    const dir = path.dirname(path.resolve(sqlitePath));
    fs.mkdirSync(dir, { recursive: true });
    const client = new Database(sqlitePath);
    const db = drizzle(client, { schema });
    return { client, db };
};
let singleton;
/**
 * Shared DB for the app (lazy). Prefer injecting `db` in tests.
 */
export const getDatabase = () => {
    if (!singleton) {
        singleton = createDatabase();
    }
    return singleton;
};
