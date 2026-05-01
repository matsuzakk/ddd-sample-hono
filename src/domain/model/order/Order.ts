import { Item } from "../item/Item.js";
import { ValidationError } from "../shared/error.js";
import {
  OrderStatus,
  OrderStatusMap,
  type OrderStatus as OrderStatusVO,
} from "./OrderStatus.js";

export type Order = {
  readonly id: number | null;
  readonly userId: number;
  readonly itemId: number;
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
  create(userId: number, item: Item): Order {
    if (!Item.isPurchasableByUser(item, userId)) {
      throw new ValidationError("Seller cannot purchase their own item");
    }

    if (Item.isPurchased(item)) {
      throw new ValidationError(
        "Item is already purchased and cannot be ordered",
      );
    }

    if (item.id === null) {
      throw new ValidationError("Item must be persisted before ordering");
    }

    const now = new Date();
    return {
      id: null,
      userId,
      itemId: item.id,
      status: OrderStatus.create(OrderStatusMap.PURCHASED),
      createdAt: now,
      updatedAt: now,
    };
  },

  reconstitute(
    id: number,
    userId: number,
    itemId: number,
    status: OrderStatusVO,
    createdAt: Date,
    updatedAt: Date,
  ): Order {
    return { id, userId, itemId, status, createdAt, updatedAt };
  },

  /** 操作者が注文の購入者本人か（キャンセル・受取完了などの可否判定用） */
  isPurchaser(order: Order, actorUserId: number): boolean {
    return order.userId === actorUserId;
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
