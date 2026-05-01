import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "../shared/error.js";
import { Order } from "./Order.js";
import { OrderHistory } from "./OrderHistory.js";
import { OrderStatus, OrderStatusMap } from "./vo/OrderStatus.js";
import { Item } from "../item/Item.js";
import { ItemPrice } from "../item/vo/ItemPrice.js";
import { ItemStatus, ItemStatusMap } from "../item/vo/ItemStatus.js";

const persistedOrder = (
  overrides: Partial<{ id: number; status: OrderStatus }> = {},
) => {
  const id = overrides.id ?? 100;
  const status =
    overrides.status ?? OrderStatus.create(OrderStatusMap.PURCHASED);
  const createdAt = new Date("2026-01-01T00:00:00.000Z");
  const updatedAt = new Date("2026-01-01T01:00:00.000Z");
  return Order.reconstitute(id, 2, 1, status, createdAt, updatedAt);
};

describe("OrderHistory", () => {
  it("create: orderId と遷移先・作成日時を持つ（id は任意）", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-02T09:00:00.000Z"));
    const to = OrderStatus.create(OrderStatusMap.SHIPPED);
    const row = OrderHistory.create(null, 5, null, to);
    expect(row.id).toBeNull();
    expect(row.orderId).toBe(5);
    expect(row.fromStatus).toBeNull();
    expect(row.toStatus).toBe(to);
    expect(row.createdAt).toEqual(new Date("2026-02-02T09:00:00.000Z"));
    vi.useRealTimers();
  });

  it("reconstitute: 保存した値を復元する", () => {
    const from = OrderStatus.create(OrderStatusMap.PURCHASED);
    const to = OrderStatus.create(OrderStatusMap.SHIPPED);
    const createdAt = new Date("2025-12-31T23:59:59.999Z");
    const row = OrderHistory.reconstitute(10, 3, from, to, createdAt);
    expect(row.id).toBe(10);
    expect(row.orderId).toBe(3);
    expect(row.fromStatus).toBe(from);
    expect(row.toStatus).toBe(to);
    expect(row.createdAt).toBe(createdAt);
  });

  it("recordTransition:同一注文 id の before/after で履歴を作る", () => {
    const before = persistedOrder({
      status: OrderStatus.create(OrderStatusMap.PURCHASED),
    });
    const after = Order.reconstitute(
      before.id as number,
      before.userId,
      before.itemId,
      OrderStatus.create(OrderStatusMap.SHIPPED),
      before.createdAt,
      new Date("2026-01-01T02:00:00.000Z"),
    );
    const history = OrderHistory.recordTransition(7, before, after);
    expect(history.id).toBe(7);
    expect(history.orderId).toBe(before.id);
    expect(history.fromStatus).toBe(before.status);
    expect(history.toStatus).toBe(after.status);
  });

  it("recordTransition: order id が一致しないとき ValidationError を投げる", () => {
    const a = persistedOrder({ id: 1 });
    const b = persistedOrder({ id: 2 });
    expect(() => OrderHistory.recordTransition(null, a, b)).toThrow(
      ValidationError,
    );

    const nullIdOrder = Order.create(
      2,
      Item.reconstitute(
        99,
        "n",
        "d",
        ItemPrice.create(1),
        ItemStatus.create(ItemStatusMap.SELLABLE),
        1,
        new Date(),
        new Date(),
      ),
    );
    const withId = Order.reconstitute(
      1,
      nullIdOrder.userId,
      nullIdOrder.itemId,
      nullIdOrder.status,
      nullIdOrder.createdAt,
      nullIdOrder.updatedAt,
    );
    const stillNull = { ...nullIdOrder, id: null } as Order;
    expect(() =>
      OrderHistory.recordTransition(null, stillNull, withId),
    ).toThrow(ValidationError);
  });
});
