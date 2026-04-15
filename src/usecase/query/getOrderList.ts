import { eq } from "drizzle-orm";
import type { AppDatabase } from "../../infrastructure/database/db.js";
import { orders } from "../../infrastructure/database/schema.js";
import { orderDtoSchema } from "../dto/orderDto.js";

type Input = {
  readonly userId: string;
};

type Deps = {
  readonly db: AppDatabase;
};

export const getOrderList = (deps: Deps, input: Input) => {
  const rows = deps.db
    .select()
    .from(orders)
    .where(eq(orders.userId, input.userId))
    .all();

  return rows.map((row) =>
    orderDtoSchema.parse({
      id: row.id,
      userId: row.userId,
      itemId: row.itemId,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }),
  );
};
