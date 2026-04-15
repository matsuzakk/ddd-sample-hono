/**
 * Runs a unit of work on one persistence session (typically a DB transaction).
 *
 * With better-sqlite3 + Drizzle, the callback runs synchronously inside
 * `db.transaction`; keep the callback synchronous (do not `async` the inner fn).
 */
export interface ITransactionManager<Tx = unknown> {
  run<R>(fn: (tx: Tx) => R): R;
}
