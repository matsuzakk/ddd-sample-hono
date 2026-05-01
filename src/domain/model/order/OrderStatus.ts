import { z } from "zod";
import { ValidationError } from "../shared/error.js";

export const OrderStatusMap = {
  PURCHASED: 0,
  SHIPPED: 1,
  DELIVERED: 2,
  CANCELED: 3,
} as const;

export type OrderStatusType =
  (typeof OrderStatusMap)[keyof typeof OrderStatusMap];

// --- Zod ブランド（注文ステータス）---

const orderStatusSym = Symbol();
const orderStatusSchema = z
  .union(
    [
      z.literal(OrderStatusMap.PURCHASED),
      z.literal(OrderStatusMap.SHIPPED),
      z.literal(OrderStatusMap.DELIVERED),
      z.literal(OrderStatusMap.CANCELED),
    ],
    { error: "Invalid order status" },
  )
  .brand(typeof orderStatusSym);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

// --- Value Object ---
export const OrderStatus = {
  create(value: OrderStatusType): OrderStatus {
    const r = orderStatusSchema.safeParse(value);
    if (!r.success) {
      const message = r.error.issues[0]?.message;
      throw new ValidationError(message, { cause: r.error });
    }
    return r.data;
  },

  reconstitute(value: number): OrderStatus {
    const r = orderStatusSchema.safeParse(value);
    if (!r.success) {
      const message = r.error.issues[0]?.message;
      throw new ValidationError(message, { cause: r.error });
    }
    return r.data;
  },

  toValue(status: OrderStatus): number {
    return status as number;
  },

  equals(a: OrderStatus, b: OrderStatus): boolean {
    return a === b;
  },

  isPurchased(status: OrderStatus): boolean {
    return OrderStatus.toValue(status) === OrderStatusMap.PURCHASED;
  },

  isShipped(status: OrderStatus): boolean {
    return OrderStatus.toValue(status) === OrderStatusMap.SHIPPED;
  },

  isDelivered(status: OrderStatus): boolean {
    return OrderStatus.toValue(status) === OrderStatusMap.DELIVERED;
  },

  isCanceled(status: OrderStatus): boolean {
    return OrderStatus.toValue(status) === OrderStatusMap.CANCELED;
  },
} as const;
