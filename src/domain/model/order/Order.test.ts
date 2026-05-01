import { describe, expect, it, vi } from "vitest";
import { Item } from "../item/Item.js";
import { ValidationError } from "../shared/error.js";
import { ItemPrice } from "../item/vo/ItemPrice.js";
import { ItemStatus, ItemStatusMap } from "../item/vo/ItemStatus.js";
import { Order } from "./Order.js";
import { OrderStatus, OrderStatusMap } from "./vo/OrderStatus.js";

const sellablePersistedItem = (sellerId: number, itemId: number) =>
  Item.reconstitute(
    itemId,
    "n",
    "d",
    ItemPrice.create(100),
    ItemStatus.create(ItemStatusMap.SELLABLE),
    sellerId,
    new Date("2024-01-01T00:00:00.000Z"),
    new Date("2024-01-01T00:00:00.000Z"),
  );

describe("Order", () => {
  it("create: 自分の出品商品は注文できない", () => {
    const item = sellablePersistedItem(7, 1);
    expect(() => Order.create(7, item)).toThrow(ValidationError);
    expect(() => Order.create(7, item)).toThrow(/Seller cannot purchase/);
  });

  it("create: 既に購入済みの商品は注文できない", () => {
    const item = Item.reconstitute(
      2,
      "n",
      "d",
      ItemPrice.create(1),
      ItemStatus.create(ItemStatusMap.PURCHASED),
      1,
      new Date(),
      new Date(),
    );
    expect(() => Order.create(99, item)).toThrow(ValidationError);
    expect(() => Order.create(99, item)).toThrow(/already purchased/);
  });

  it("create: 未永続の商品は注文できない", () => {
    const draft = Item.create("n", "d", ItemPrice.create(1), 1);
    expect(draft.id).toBeNull();
    expect(() => Order.create(2, draft)).toThrow(ValidationError);
    expect(() => Order.create(2, draft)).toThrow(/persisted before ordering/);
  });

  it("create: 購入可能な永続済み商品から注文を作成すると PURCHASED になる", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-01T10:00:00.000Z"));
    const item = sellablePersistedItem(1, 10);
    const order = Order.create(2, item);
    expect(order.id).toBeNull();
    expect(order.userId).toBe(2);
    expect(order.itemId).toBe(10);
    expect(OrderStatus.toValue(order.status)).toBe(OrderStatusMap.PURCHASED);
    expect(order.createdAt).toEqual(order.updatedAt);
    vi.useRealTimers();
  });

  it("isPurchaser: 購入者一致で true", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    const order = Order.create(55, sellablePersistedItem(1, 3));
    const persisted = Order.reconstitute(
      1,
      order.userId,
      order.itemId,
      order.status,
      order.createdAt,
      order.updatedAt,
    );
    expect(Order.isPurchaser(persisted, 55)).toBe(true);
    expect(Order.isPurchaser(persisted, 56)).toBe(false);
    vi.useRealTimers();
  });

  it("markShipped: 購入済みからのみ発送に遷移できる", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    const placed = Order.create(2, sellablePersistedItem(1, 1));
    const order = Order.reconstitute(
      1,
      placed.userId,
      placed.itemId,
      placed.status,
      placed.createdAt,
      placed.updatedAt,
    );
    vi.setSystemTime(new Date("2026-01-01T01:00:00.000Z"));
    const shipped = Order.markShipped(order);
    expect(OrderStatus.toValue(shipped.status)).toBe(OrderStatusMap.SHIPPED);
    expect(shipped.updatedAt.getTime()).toBeGreaterThan(
      order.updatedAt.getTime(),
    );
    expect(() =>
      Order.markShipped(
        Order.reconstitute(
          1,
          shipped.userId,
          shipped.itemId,
          shipped.status,
          shipped.createdAt,
          shipped.updatedAt,
        ),
      ),
    ).toThrow(ValidationError);
    vi.useRealTimers();
  });

  it("markDelivered: 発送済みからのみ配達済みへ遷移できる", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    const placed = Order.create(2, sellablePersistedItem(1, 1));
    let order = Order.reconstitute(
      9,
      placed.userId,
      placed.itemId,
      placed.status,
      placed.createdAt,
      placed.updatedAt,
    );
    vi.setSystemTime(new Date("2026-01-01T02:00:00.000Z"));
    order = Order.markShipped(order);
    vi.setSystemTime(new Date("2026-01-01T03:00:00.000Z"));
    const delivered = Order.markDelivered(order);
    expect(OrderStatus.toValue(delivered.status)).toBe(
      OrderStatusMap.DELIVERED,
    );
    expect(() => Order.markDelivered(placed)).toThrow(ValidationError);
    vi.useRealTimers();
  });

  it("cancel: 購入済みからのみキャンセルに遷移できる", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-05T12:00:00.000Z"));
    const placed = Order.create(2, sellablePersistedItem(1, 1));
    const order = Order.reconstitute(
      3,
      placed.userId,
      placed.itemId,
      placed.status,
      placed.createdAt,
      placed.updatedAt,
    );
    vi.setSystemTime(new Date("2026-05-05T13:00:00.000Z"));
    const canceled = Order.cancel(order);
    expect(OrderStatus.toValue(canceled.status)).toBe(OrderStatusMap.CANCELED);
    const shipped = Order.markShipped(
      Order.reconstitute(
        4,
        order.userId,
        order.itemId,
        order.status,
        order.createdAt,
        order.updatedAt,
      ),
    );
    expect(() => Order.cancel(shipped)).toThrow(ValidationError);
    vi.useRealTimers();
  });
});
