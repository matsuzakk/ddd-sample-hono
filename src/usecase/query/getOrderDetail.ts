import { eq } from "drizzle-orm";
import type { AppDatabase } from "../../infrastructure/database/db.js";
import { orderHistories, orders } from "../../infrastructure/database/schema.js";
import { orderDtoSchema, type OrderDto } from "../dto/orderDto.js";
import {
  orderHistoryDtoSchema,
  type OrderHistoryDto,
} from "../dto/orderHistoryDto.js";

export type Deps = {
  readonly db: AppDatabase;
};

export type Input = {
  readonly orderId: string;
};

export const getOrderDetail = (
  deps: Deps,
  input: Input,
): { order: OrderDto | null; histories: OrderHistoryDto[] } => {
  const orderRow = deps.db
    .select()
    .from(orders)
    .where(eq(orders.id, input.orderId))
    .limit(1)
    .all()[0];

  if (!orderRow) {
    return { order: null, histories: [] };
  }

  const orderResult = orderDtoSchema.parse({
    id: orderRow.id,
    userId: orderRow.userId,
    itemId: orderRow.itemId,
    status: orderRow.status,
    createdAt: orderRow.createdAt,
    updatedAt: orderRow.updatedAt,
  });

  const historyRows = deps.db
    .select()
    .from(orderHistories)
    .where(eq(orderHistories.orderId, input.orderId))
    .all();

  const historiesResult = historyRows.map((row) =>
    orderHistoryDtoSchema.parse({
      id: row.id,
      orderId: row.orderId,
      fromStatus: row.fromStatus,
      toStatus: row.toStatus,
      createdAt: row.createdAt,
    }),
  );

  return { order: orderResult, histories: historiesResult };
};
