import type { ITransactionManager } from "../../domain/model/shared/ITransactionManager.js";
import type { AppDatabase, DbClient } from "./db.js";

export const createTransactionManager = (
  db: AppDatabase,
): ITransactionManager<DbClient> => ({
  run: (fn) => db.transaction((tx) => fn(tx)),
});
