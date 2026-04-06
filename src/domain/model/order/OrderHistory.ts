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
}
