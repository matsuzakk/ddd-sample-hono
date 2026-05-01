import { eq } from "drizzle-orm";
import type { AppDatabase } from "../../infrastructure/database/db.js";
import { orders } from "../../infrastructure/database/schema.js";
import { orderDtoSchema, type OrderDto } from "../dto/orderDto.js";

type Deps = {
  readonly db: AppDatabase;
};

type Input = {
  readonly userId: number;
};

export const getOrderListUsecase = (deps: Deps, input: Input): OrderDto[] => {
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
