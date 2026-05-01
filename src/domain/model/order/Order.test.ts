import { describe, expect, it, vi } from "vitest";
import { Item } from "../item/Item.js";
import { ItemPrice } from "../item/ItemPrice.js";
import { ItemStatus, ItemStatusMap } from "../item/ItemStatus.js";
import { ValidationError } from "../shared/error.js";
import { Order } from "./Order.js";
import { OrderStatus, OrderStatusMap } from "./OrderStatus.js";

const sellableItem = (sellerId: number) =>
  Item.reconstitute(
    1,
    "Book",
    "Good book",
    ItemPrice.create(500),
    ItemStatus.create(ItemStatusMap.SELLABLE),
    sellerId,
    new Date("2024-01-01T00:00:00.000Z"),
    new Date("2024-01-02T00:00:00.000Z"),
  );

const purchasedItem = (sellerId: number) => {
  const { createdAt, updatedAt } = {
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
  };
  return Item.reconstitute(
    2,
    "Book",
    "Good book",
    ItemPrice.create(500),
    ItemStatus.create(ItemStatusMap.PURCHASED),
    sellerId,
    createdAt,
    updatedAt,
  );
};

describe("Order", () => {
  it("create は購入可能な商品から注文を返す", () => {
    const item = sellableItem(2);
    const order = Order.create(1, item);
    expect(order.id).toBeNull();
    expect(order.userId).toBe(1);
    expect(order.itemId).toBe(1);
    expect(OrderStatus.isPurchased(order.status)).toBe(true);
  });

  it("create は出品者自身の購入を拒否する", () => {
    const item = sellableItem(1);
    expect(() => Order.create(1, item)).toThrow(ValidationError);
  });

  it("create は購入済み商品を拒否する", () => {
    const item = purchasedItem(1);
    expect(() => Order.create(2, item)).toThrow(ValidationError);
  });

  it("create は id のない商品を拒否する", () => {
    const item = Item.create("n", "d", ItemPrice.create(0), 1);
    expect(() => Order.create(2, item)).toThrow(ValidationError);
  });

  it("markShipped は購入済みから発送済みへ遷移する", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
    const order = Order.create(1, sellableItem(2));
    const before = order.updatedAt.getTime();
    vi.setSystemTime(new Date("2025-01-01T00:00:05.000Z"));
    const shipped = Order.markShipped(order);
    expect(OrderStatus.isShipped(shipped.status)).toBe(true);
    expect(shipped.updatedAt.getTime()).toBeGreaterThan(before);
    vi.useRealTimers();
  });

  it("markShipped は購入済み以外で ValidationError を投げる", () => {
    const order = Order.reconstitute(
      1,
      1,
      1,
      OrderStatus.create(OrderStatusMap.SHIPPED),
      new Date(),
      new Date(),
    );
    expect(() => Order.markShipped(order)).toThrow(ValidationError);
  });

  it("markDelivered は発送済みから到着済みへ遷移する", () => {
    const order = Order.reconstitute(
      1,
      1,
      1,
      OrderStatus.create(OrderStatusMap.SHIPPED),
      new Date(),
      new Date(),
    );
    const delivered = Order.markDelivered(order);
    expect(OrderStatus.isDelivered(delivered.status)).toBe(true);
  });

  it("markDelivered は発送済み以外で ValidationError を投げる", () => {
    const purchased = Order.reconstitute(
      1,
      1,
      1,
      OrderStatus.create(OrderStatusMap.PURCHASED),
      new Date(),
      new Date(),
    );
    expect(() => Order.markDelivered(purchased)).toThrow(ValidationError);
  });

  it("cancel は購入済みからキャンセルへ遷移する", () => {
    const order = Order.create(1, sellableItem(2));
    const canceled = Order.cancel(order);
    expect(OrderStatus.isCanceled(canceled.status)).toBe(true);
  });

  it("cancel は購入済み以外で ValidationError を投げる", () => {
    const shipped = Order.reconstitute(
      1,
      1,
      1,
      OrderStatus.create(OrderStatusMap.SHIPPED),
      new Date(),
      new Date(),
    );
    expect(() => Order.cancel(shipped)).toThrow(ValidationError);
  });

  it("isPurchaser は購入者と一致すると true", () => {
    const order = Order.create(5, sellableItem(2));
    expect(Order.isPurchaser(order, 5)).toBe(true);
  });

  it("isPurchaser は購入者と一致しないと false", () => {
    const order = Order.create(5, sellableItem(2));
    expect(Order.isPurchaser(order, 99)).toBe(false);
  });
});
