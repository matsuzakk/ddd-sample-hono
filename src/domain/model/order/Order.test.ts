import { describe, expect, it, vi } from "vitest";
import { Item } from "../item/Item.js";
import { ItemPrice } from "../item/ItemPrice.js";
import { ItemStatus, ItemStatusMap } from "../item/ItemStatus.js";
import { ValidationError } from "../shared/error.js";
import { Order } from "./Order.js";
import { OrderStatus, OrderStatusMap } from "./OrderStatus.js";

const sellableItem = (sellerId: string) =>
  Item.create("item-1", "Book", "Good book", ItemPrice.create(500), sellerId);

const purchasedItem = (sellerId: string) => {
  const { createdAt, updatedAt } = {
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-02T00:00:00.000Z"),
  };
  return Item.reconstitute(
    "item-p",
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
    const item = sellableItem("seller-1");
    const order = Order.create("order-1", "buyer-1", item);
    expect(order.id).toBe("order-1");
    expect(order.userId).toBe("buyer-1");
    expect(order.itemId).toBe(item.id);
    expect(OrderStatus.isPurchased(order.status)).toBe(true);
  });

  it("create は出品者自身の購入を拒否する", () => {
    const item = sellableItem("seller-1");
    expect(() => Order.create("o", "seller-1", item)).toThrow(ValidationError);
  });

  it("create は購入済み商品を拒否する", () => {
    const item = purchasedItem("seller-1");
    expect(() => Order.create("o", "buyer-1", item)).toThrow(ValidationError);
  });

  it("markShipped は購入済みから発送済みへ遷移する", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
    const order = Order.create("o", "b", sellableItem("s"));
    const before = order.updatedAt.getTime();
    vi.setSystemTime(new Date("2025-01-01T00:00:05.000Z"));
    const shipped = Order.markShipped(order);
    expect(OrderStatus.isShipped(shipped.status)).toBe(true);
    expect(shipped.updatedAt.getTime()).toBeGreaterThan(before);
    vi.useRealTimers();
  });

  it("markShipped は購入済み以外で ValidationError を投げる", () => {
    const order = Order.reconstitute(
      "o",
      "u",
      "i",
      OrderStatus.create(OrderStatusMap.SHIPPED),
      new Date(),
      new Date(),
    );
    expect(() => Order.markShipped(order)).toThrow(ValidationError);
  });

  it("markDelivered は発送済みから到着済みへ遷移する", () => {
    const order = Order.reconstitute(
      "o",
      "u",
      "i",
      OrderStatus.create(OrderStatusMap.SHIPPED),
      new Date(),
      new Date(),
    );
    const delivered = Order.markDelivered(order);
    expect(OrderStatus.isDelivered(delivered.status)).toBe(true);
  });

  it("markDelivered は発送済み以外で ValidationError を投げる", () => {
    const purchased = Order.reconstitute(
      "o",
      "u",
      "i",
      OrderStatus.create(OrderStatusMap.PURCHASED),
      new Date(),
      new Date(),
    );
    expect(() => Order.markDelivered(purchased)).toThrow(ValidationError);
  });

  it("cancel は購入済みからキャンセルへ遷移する", () => {
    const order = Order.create("o", "b", sellableItem("s"));
    const canceled = Order.cancel(order);
    expect(OrderStatus.isCanceled(canceled.status)).toBe(true);
  });

  it("cancel は購入済み以外で ValidationError を投げる", () => {
    const shipped = Order.reconstitute(
      "o",
      "u",
      "i",
      OrderStatus.create(OrderStatusMap.SHIPPED),
      new Date(),
      new Date(),
    );
    expect(() => Order.cancel(shipped)).toThrow(ValidationError);
  });
});
