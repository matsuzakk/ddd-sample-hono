import { Item } from "../item/Item.js";
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
      throw new Error("出品者はその商品を購入することはできません");
    }

    if (Item.isPurchased(item)) {
      throw new Error("商品はすでに購入されているため注文できません");
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
      throw new Error("Order cannot be shipped");
    }
    return withStatus(order, OrderStatus.create(OrderStatusMap.SHIPPED));
  },

  markDelivered(order: Order): Order {
    if (!OrderStatus.isShipped(order.status)) {
      throw new Error("Order cannot be delivered");
    }
    return withStatus(order, OrderStatus.create(OrderStatusMap.DELIVERED));
  },

  /** 購入済のみキャンセル可能 */
  cancel(order: Order): Order {
    if (!OrderStatus.isPurchased(order.status)) {
      throw new Error("Order cannot be canceled");
    }
    return withStatus(order, OrderStatus.create(OrderStatusMap.CANCELED));
  },
} as const;
