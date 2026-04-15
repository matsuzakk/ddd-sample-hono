import type { IOrderHistoryRepository } from "../../domain/model/order/IOrderRepository.js";
import { OrderHistory } from "../../domain/model/order/OrderHistory.js";
import { OrderStatus } from "../../domain/model/order/OrderStatus.js";
import type { DbClient } from "../database/db.js";
import { orderHistories } from "../database/schema.js";

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
            ? OrderStatus.toValue(orderHistory.fromStatus)
            : null,
        toStatus: OrderStatus.toValue(orderHistory.toStatus),
        createdAt: orderHistory.createdAt,
      })
      .run();
  },
});
