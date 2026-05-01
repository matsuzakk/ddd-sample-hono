import { z } from "zod";
import { ValidationError } from "../shared/error.js";
import type { Order } from "./Order.js";
import type { OrderStatus } from "./vo/OrderStatus.js";

// --- データ（状態）---

export type OrderHistory = Readonly<{
  id: number | null;
  orderId: number;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  createdAt: Date;
}>;

// --- 振る舞い（純粋関数）---

/**
 * コンストラクタ
 * @param id - 注文履歴ID
 * @param orderId - 注文ID
 * @param fromStatus - 前の状態
 * @param toStatus - 新しい状態
 * @returns 作成された注文履歴
 */
const create = (
  id: number | null,
  orderId: number,
  fromStatus: OrderStatus | null,
  toStatus: OrderStatus,
): OrderHistory => ({
  id,
  orderId,
  fromStatus,
  toStatus,
  createdAt: new Date(),
});

/**
 * レコードから復元する
 * @param id - 注文履歴ID
 * @param orderId - 注文ID
 * @param fromStatus - 前の状態
 * @param toStatus - 新しい状態
 * @param createdAt - 作成日時
 * @returns 復元された注文履歴
 */
const reconstitute = (
  id: number,
  orderId: number,
  fromStatus: OrderStatus | null,
  toStatus: OrderStatus,
  createdAt: Date,
): OrderHistory => ({
  id,
  orderId,
  fromStatus,
  toStatus,
  createdAt,
});

/**
 * 注文の状態遷移を記録する
 * @param id - 注文履歴ID
 * @param before - 前の注文
 * @param after - 新しい注文
 * @returns 記録された注文履歴
 */
const recordTransition = (
  id: number | null,
  before: Order,
  after: Order,
): OrderHistory => {
  if (before.id === null || after.id === null || before.id !== after.id) {
    throw new ValidationError("Order history must reference a single order");
  }
  return OrderHistory.create(
    id,
    before.id as number,
    before.status,
    after.status,
  );
};

// --- エンティティ(コンパニオンオブジェクト) ---

export const OrderHistory = {
  create,
  reconstitute,
  recordTransition,
} as const;
