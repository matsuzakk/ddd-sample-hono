import { describe, expect, it } from "vitest";
import { ValidationError } from "../shared/error.js";
import { Order } from "./Order.js";
import { OrderHistory } from "./OrderHistory.js";
import { OrderStatus, OrderStatusMap } from "./OrderStatus.js";

describe("OrderHistory", () => {
  it("create は遷移情報を保持する", () => {
    const from = OrderStatus.create(OrderStatusMap.PURCHASED);
    const to = OrderStatus.create(OrderStatusMap.SHIPPED);
    const h = OrderHistory.create("h-1", "order-1", from, to);
    expect(h.id).toBe("h-1");
    expect(h.orderId).toBe("order-1");
    expect(h.fromStatus).toBe(from);
    expect(h.toStatus).toBe(to);
    expect(h.createdAt).toBeInstanceOf(Date);
  });

  it("create は初回遷移で from を null にできる", () => {
    const to = OrderStatus.create(OrderStatusMap.PURCHASED);
    const h = OrderHistory.create("h-1", "order-1", null, to);
    expect(h.fromStatus).toBeNull();
    expect(h.toStatus).toBe(to);
  });

  it("reconstitute は保存済み行から復元する", () => {
    const at = new Date("2024-05-01T00:00:00.000Z");
    const to = OrderStatus.create(OrderStatusMap.DELIVERED);
    const h = OrderHistory.reconstitute("h-1", "order-1", null, to, at);
    expect(h.createdAt).toEqual(at);
  });

  it("recordTransition は同一注文の before/after から履歴を作る", () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    const updatedAt = new Date("2024-01-01T00:00:01.000Z");
    const before = Order.reconstitute(
      "order-1",
      "u",
      "i",
      OrderStatus.create(OrderStatusMap.PURCHASED),
      createdAt,
      updatedAt,
    );
    const after = Order.reconstitute(
      "order-1",
      "u",
      "i",
      OrderStatus.create(OrderStatusMap.SHIPPED),
      createdAt,
      new Date("2024-01-01T00:00:02.000Z"),
    );
    const h = OrderHistory.recordTransition("hist-1", before, after);
    expect(h.orderId).toBe("order-1");
    expect(h.fromStatus).toBe(before.status);
    expect(h.toStatus).toBe(after.status);
  });

  it("recordTransition は注文 ID が異なると ValidationError を投げる", () => {
    const createdAt = new Date();
    const before = Order.reconstitute(
      "a",
      "u",
      "i",
      OrderStatus.create(OrderStatusMap.PURCHASED),
      createdAt,
      createdAt,
    );
    const after = Order.reconstitute(
      "b",
      "u",
      "i",
      OrderStatus.create(OrderStatusMap.SHIPPED),
      createdAt,
      createdAt,
    );
    expect(() => OrderHistory.recordTransition("h", before, after)).toThrow(
      ValidationError,
    );
  });
});
