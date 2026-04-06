import { eq } from "drizzle-orm";
import type { IOrderHistoryRepository } from "../../domain/model/order/IOrderRepository.js";
import { OrderHistory } from "../../domain/model/order/OrderHistory.js";
import { OrderStatus } from "../../domain/model/order/OrderStatus.js";
import type { DbClient } from "./db.js";
import { orderHistories } from "./schema.js";

export const createOrderHistoryRepository = (
  db: DbClient,
): IOrderHistoryRepository => ({
  create: async (orderHistory: OrderHistory) => {
    await db.insert(orderHistories).values({
      id: orderHistory.id,
      orderId: orderHistory.orderId,
      fromStatus: orderHistory.fromStatus.toValue(),
      toStatus: orderHistory.toStatus.toValue(),
      createdAt: orderHistory.createdAt,
    });
  },
  findByOrderId: async (orderId: string) => {
    const rows = await db
      .select()
      .from(orderHistories)
      .where(eq(orderHistories.orderId, orderId));
    return rows.map((row) =>
      OrderHistory.reconstitute(
        row.id,
        row.orderId,
        OrderStatus.reconstitute(row.fromStatus),
        OrderStatus.reconstitute(row.toStatus),
        row.createdAt,
      ),
    );
  },
});
