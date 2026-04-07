import type { Order } from "./Order.js";
import type { OrderStatus } from "./OrderStatus.js";

export type OrderHistory = {
  readonly id: string;
  readonly orderId: string;
  readonly fromStatus: OrderStatus | null;
  readonly toStatus: OrderStatus;
  readonly createdAt: Date;
};

export const OrderHistory = {
  create(
    id: string,
    orderId: string,
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
  ): OrderHistory {
    return {
      id,
      orderId,
      fromStatus,
      toStatus,
      createdAt: new Date(),
    };
  },

  reconstitute(
    id: string,
    orderId: string,
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
    createdAt: Date,
  ): OrderHistory {
    return { id, orderId, fromStatus, toStatus, createdAt };
  },

  /** 同一注文の状態遷移を記録する（集約の遷移と履歴を揃える） */
  recordTransition(id: string, before: Order, after: Order): OrderHistory {
    if (before.id !== after.id) {
      throw new Error("Order history must reference a single order");
    }
    return OrderHistory.create(id, before.id, before.status, after.status);
  },
} as const;
