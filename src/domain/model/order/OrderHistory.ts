import { ValidationError } from "../shared/error.js";
import type { Order } from "./Order.js";
import type { OrderStatus } from "./OrderStatus.js";

export type OrderHistory = {
  readonly id: number | null;
  readonly orderId: number;
  readonly fromStatus: OrderStatus | null;
  readonly toStatus: OrderStatus;
  readonly createdAt: Date;
};

export const OrderHistory = {
  create(
    id: number | null,
    orderId: number,
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
    id: number,
    orderId: number,
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
    createdAt: Date,
  ): OrderHistory {
    return { id, orderId, fromStatus, toStatus, createdAt };
  },

  /** 同一注文の状態遷移を記録する（集約の遷移と履歴を揃える） */
  recordTransition(
    id: number | null,
    before: Order,
    after: Order,
  ): OrderHistory {
    if (
      before.id === null ||
      after.id === null ||
      before.id !== after.id
    ) {
      throw new ValidationError("Order history must reference a single order");
    }
    return OrderHistory.create(id, before.id, before.status, after.status);
  },
} as const;
