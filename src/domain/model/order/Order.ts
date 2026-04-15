import { Item } from "../item/Item.js";
import { ValidationError } from "../shared/error.js";
import {
  OrderStatus,
  OrderStatusMap,
  type OrderStatus as OrderStatusVO,
} from "./OrderStatus.js";

export type Order = {
  readonly id: string;
  readonly userId: string;
  readonly itemId: string;
  readonly status: OrderStatusVO;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

function withStatus(order: Order, status: OrderStatusVO): Order {
  return {
    ...order,
    status,
    updatedAt: new Date(),
  };
}

export const Order = {
  create(id: string, userId: string, item: Item): Order {
    if (!Item.isPurchasableByUser(item, userId)) {
      throw new ValidationError("Seller cannot purchase their own item");
    }

    if (Item.isPurchased(item)) {
      throw new ValidationError(
        "Item is already purchased and cannot be ordered",
      );
    }

    const now = new Date();
    return {
      id,
      userId,
      itemId: item.id,
      status: OrderStatus.create(OrderStatusMap.PURCHASED),
      createdAt: now,
      updatedAt: now,
    };
  },

  reconstitute(
    id: string,
    userId: string,
    itemId: string,
    status: OrderStatusVO,
    createdAt: Date,
    updatedAt: Date,
  ): Order {
    return { id, userId, itemId, status, createdAt, updatedAt };
  },

  markShipped(order: Order): Order {
    if (!OrderStatus.isPurchased(order.status)) {
      throw new ValidationError("Order cannot be shipped");
    }
    return withStatus(order, OrderStatus.create(OrderStatusMap.SHIPPED));
  },

  markDelivered(order: Order): Order {
    if (!OrderStatus.isShipped(order.status)) {
      throw new ValidationError("Order cannot be delivered");
    }
    return withStatus(order, OrderStatus.create(OrderStatusMap.DELIVERED));
  },

  /** 購入済のみキャンセル可能 */
  cancel(order: Order): Order {
    if (!OrderStatus.isPurchased(order.status)) {
      throw new ValidationError("Order cannot be canceled");
    }
    return withStatus(order, OrderStatus.create(OrderStatusMap.CANCELED));
  },
} as const;
