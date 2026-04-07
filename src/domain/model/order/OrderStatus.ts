import type { Brand } from "../shared/brand.js";

export const OrderStatusMap = {
  PURCHASED: 0,
  SHIPPED: 1,
  DELIVERED: 2,
  CANCELED: 3,
} as const;

export type OrderStatusType =
  (typeof OrderStatusMap)[keyof typeof OrderStatusMap];

export type OrderStatus = Brand<OrderStatusType, "OrderStatus">;

const ORDER_STATUS_VALUES: ReadonlySet<number> = new Set([
  OrderStatusMap.PURCHASED,
  OrderStatusMap.SHIPPED,
  OrderStatusMap.DELIVERED,
  OrderStatusMap.CANCELED,
]);

export const OrderStatus = {
  /**
   * 0: 購入済, 1: 発送済, 2: 到着済, 3: キャンセル
   */
  create(value: OrderStatusType): OrderStatus {
    return value as OrderStatus;
  },

  reconstitute(value: number): OrderStatus {
    if (!ORDER_STATUS_VALUES.has(value)) {
      throw new Error(`Invalid order status: ${value}`);
    }
    return value as OrderStatus;
  },

  toValue(status: OrderStatus): number {
    return status as number;
  },

  equals(a: OrderStatus, b: OrderStatus): boolean {
    return a === b;
  },

  isPurchased(status: OrderStatus): boolean {
    return (status as OrderStatusType) === OrderStatusMap.PURCHASED;
  },

  isShipped(status: OrderStatus): boolean {
    return (status as OrderStatusType) === OrderStatusMap.SHIPPED;
  },

  isDelivered(status: OrderStatus): boolean {
    return (status as OrderStatusType) === OrderStatusMap.DELIVERED;
  },

  isCanceled(status: OrderStatus): boolean {
    return (status as OrderStatusType) === OrderStatusMap.CANCELED;
  },
} as const;
