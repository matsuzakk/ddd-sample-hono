import { z } from "zod";
import { Item } from "../item/Item.js";
import { ValidationError } from "../shared/error.js";
import {
  OrderStatus,
  OrderStatusMap,
  type OrderStatus as OrderStatusVO,
} from "./OrderStatus.js";

// --- Zod ブランド（ID）---

const orderUserIdSym = Symbol();
export const OrderUserId = z
  .number()
  .int()
  .positive()
  .brand(typeof orderUserIdSym);
export type OrderUserId = z.infer<typeof OrderUserId>;

const orderItemIdSym = Symbol();
export const OrderItemId = z
  .number()
  .int()
  .positive()
  .brand(typeof orderItemIdSym);
export type OrderItemId = z.infer<typeof OrderItemId>;

const orderRecordIdSym = Symbol();
export const OrderRecordId = z
  .union([z.number().int().positive(), z.null()])
  .brand(typeof orderRecordIdSym);
export type OrderRecordId = z.infer<typeof OrderRecordId>;

// --- データ（状態）---

export type Order = Readonly<{
  id: OrderRecordId;
  userId: OrderUserId;
  itemId: OrderItemId;
  status: OrderStatusVO;
  createdAt: Date;
  updatedAt: Date;
}>;

// --- 振る舞い（純粋関数）---

/**
 * コンストラクタ
 * @param userId - ユーザーID
 * @param item - 商品
 * @returns 作成された注文
 */
const create = (userId: number, item: Item): Order => {
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
    id: OrderRecordId.parse(null),
    userId: OrderUserId.parse(userId),
    itemId: OrderItemId.parse(item.id),
    status: OrderStatus.create(OrderStatusMap.PURCHASED),
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * レコードから復元する
 * @param id - 注文ID
 * @param userId - ユーザーID
 * @param itemId - 商品ID
 * @param status - 注文の状態
 * @param createdAt - 作成日時
 * @param updatedAt - 更新日時
 * @returns 復元された注文
 */
const reconstitute = (
  id: number,
  userId: number,
  itemId: number,
  status: OrderStatusVO,
  createdAt: Date,
  updatedAt: Date,
): Order => ({
  id: OrderRecordId.parse(id),
  userId: OrderUserId.parse(userId),
  itemId: OrderItemId.parse(itemId),
  status,
  createdAt,
  updatedAt,
});

/**
 * 注文者が購入者本人かどうかを判定する
 * @param order - 注文
 * @param actorUserId - 判定者のユーザーID
 * @returns 注文者が購入者本人かどうか
 */
const isPurchaser = (order: Order, actorUserId: number): boolean =>
  (order.userId as number) === actorUserId;

/**
 * 注文の状態を更新する
 * @param order - 注文
 * @param status - 注文の状態
 * @returns 更新後の注文
 */
const withStatus = (order: Order, status: OrderStatusVO): Order => ({
  ...order,
  status,
  updatedAt: new Date(),
});

/**
 * 注文を発送する
 * @param order - 注文
 * @returns 発送された注文
 */
const markShipped = (order: Order): Order => {
  if (!OrderStatus.isPurchased(order.status)) {
    throw new ValidationError("Order cannot be shipped");
  }
  return withStatus(order, OrderStatus.create(OrderStatusMap.SHIPPED));
};

/**
 * 注文を到着させる
 * @param order - 注文
 * @returns 到着された注文
 */
const markDelivered = (order: Order): Order => {
  if (!OrderStatus.isShipped(order.status)) {
    throw new ValidationError("Order cannot be delivered");
  }
  return withStatus(order, OrderStatus.create(OrderStatusMap.DELIVERED));
};

/**
 * 注文をキャンセルする
 * @param order - 注文
 * @returns キャンセルされた注文
 */
const cancel = (order: Order): Order => {
  if (!OrderStatus.isPurchased(order.status)) {
    throw new ValidationError("Order cannot be canceled");
  }
  return withStatus(order, OrderStatus.create(OrderStatusMap.CANCELED));
};

// --- エンティティ(コンパニオンオブジェクト) ---

export const Order = {
  create,
  reconstitute,
  isPurchaser,
  markShipped,
  markDelivered,
  cancel,
} as const;
