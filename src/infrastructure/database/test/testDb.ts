import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type { ITransactionManager } from "../../../domain/model/shared/ITransactionManager.js";
import type { AppDatabase, DbClient } from "../db.js";
import * as schema from "../schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = join(__dirname, "../migrations");

/**
 * 空の in-memory DB にマイグレーションをすべて適用した `AppDatabase`。
 * 新しい `migrations/*.sql` は `drizzle-kit generate` で追加され、ジャーナル経由で自動追従する。
 */
export const createMemoryAppDatabase = (): {
  readonly db: AppDatabase;
  readonly close: () => void;
} => {
  const client = new Database(":memory:");
  const db = drizzle(client, { schema });
  migrate(db, { migrationsFolder });
  return {
    db,
    close: () => {
      client.close();
    },
  };
};

/**
 * テスト用 DB のライフサイクル（`close`）をまとめる。コールバック内で例外が出ても `close` する。
 */
export const withMemoryAppDatabase = (fn: (db: AppDatabase) => void): void => {
  const { db, close } = createMemoryAppDatabase();
  try {
    fn(db);
  } finally {
    close();
  }
};

/**
 * ユースケーステスト用: `db.transaction` と同様に同期コールバックをその場で実行する。
 * モックリポジトリは `tx` を参照しない想定。
 */
export const createPassthroughTxManager =
  (): ITransactionManager<DbClient> => ({
    run: (fn) => fn({} as DbClient),
  });
