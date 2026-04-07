import { eq } from "drizzle-orm";
import type { IOrderHistoryRepository } from "../../domain/model/order/IOrderRepository.js";
import { OrderHistory } from "../../domain/model/order/OrderHistory.js";
import { OrderStatus } from "../../domain/model/order/OrderStatus.js";
import type { DbClient } from "./db.js";
import { orderHistories } from "./schema.js";

export const createOrderHistoryRepository = (
  db: DbClient,
): IOrderHistoryRepository => ({
  create: (orderHistory: OrderHistory) => {
    db.insert(orderHistories)
      .values({
        id: orderHistory.id,
        orderId: orderHistory.orderId,
        fromStatus:
          orderHistory.fromStatus !== null
            ? orderHistory.fromStatus.toValue()
            : null,
        toStatus: orderHistory.toStatus.toValue(),
        createdAt: orderHistory.createdAt,
      })
      .run();
  },
  findByOrderId: (orderId: string) => {
    const rows = db
      .select()
      .from(orderHistories)
      .where(eq(orderHistories.orderId, orderId))
      .all();
    return rows.map((row) =>
      OrderHistory.reconstitute(
        row.id,
        row.orderId,
        row.fromStatus == null
          ? null
          : OrderStatus.reconstitute(row.fromStatus),
        OrderStatus.reconstitute(row.toStatus),
        row.createdAt,
      ),
    );
  },
});
