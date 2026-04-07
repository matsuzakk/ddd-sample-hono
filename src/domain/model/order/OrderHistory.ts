import type { Order } from "./Order.js";
import type { OrderStatus } from "./OrderStatus.js";

export class OrderHistory {
  private constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly fromStatus: OrderStatus,
    public readonly toStatus: OrderStatus,
    public readonly createdAt: Date,
  ) {}

  public static create(
    id: string,
    orderId: string,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
  ): OrderHistory {
    return new OrderHistory(id, orderId, fromStatus, toStatus, new Date());
  }

  public static reconstitute(
    id: string,
    orderId: string,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
    createdAt: Date,
  ): OrderHistory {
    return new OrderHistory(id, orderId, fromStatus, toStatus, createdAt);
  }

  /** 同一注文の状態遷移を記録する（集約の遷移と履歴を揃える） */
  public static recordOrderTransition(
    id: string,
    before: Order,
    after: Order,
  ): OrderHistory {
    if (before.id !== after.id) {
      throw new Error("Order history must reference a single order");
    }
    return OrderHistory.create(id, before.id, before.status, after.status);
  }
}
