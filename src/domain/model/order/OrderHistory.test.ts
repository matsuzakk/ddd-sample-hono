import { describe, expect, it } from "vitest";
import { ValidationError } from "../shared/error.js";
import { Order } from "./Order.js";
import { OrderHistory } from "./OrderHistory.js";
import { OrderStatus, OrderStatusMap } from "./vo/OrderStatus.js";

describe("OrderHistory", () => {
  it("create は遷移情報を保持する", () => {
    const from = OrderStatus.create(OrderStatusMap.PURCHASED);
    const to = OrderStatus.create(OrderStatusMap.SHIPPED);
    const h = OrderHistory.create(null, 42, from, to);
    expect(h.id).toBeNull();
    expect(h.orderId).toBe(42);
    expect(h.fromStatus).toBe(from);
    expect(h.toStatus).toBe(to);
    expect(h.createdAt).toBeInstanceOf(Date);
  });

  it("create は初回遷移で from を null にできる", () => {
    const to = OrderStatus.create(OrderStatusMap.PURCHASED);
    const h = OrderHistory.create(null, 1, null, to);
    expect(h.fromStatus).toBeNull();
    expect(h.toStatus).toBe(to);
  });

  it("reconstitute は保存済み行から復元する", () => {
    const at = new Date("2024-05-01T00:00:00.000Z");
    const to = OrderStatus.create(OrderStatusMap.DELIVERED);
    const h = OrderHistory.reconstitute(9, 1, null, to, at);
    expect(h.createdAt).toEqual(at);
  });

  it("recordTransition は同一注文の before/after から履歴を作る", () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    const updatedAt = new Date("2024-01-01T00:00:01.000Z");
    const before = Order.reconstitute(
      1,
      1,
      1,
      OrderStatus.create(OrderStatusMap.PURCHASED),
      createdAt,
      updatedAt,
    );
    const after = Order.reconstitute(
      1,
      1,
      1,
      OrderStatus.create(OrderStatusMap.SHIPPED),
      createdAt,
      new Date("2024-01-01T00:00:02.000Z"),
    );
    const h = OrderHistory.recordTransition(null, before, after);
    expect(h.orderId).toBe(1);
    expect(h.fromStatus).toBe(before.status);
    expect(h.toStatus).toBe(after.status);
  });

  it("recordTransition は注文 ID が異なると ValidationError を投げる", () => {
    const createdAt = new Date();
    const before = Order.reconstitute(
      1,
      1,
      1,
      OrderStatus.create(OrderStatusMap.PURCHASED),
      createdAt,
      createdAt,
    );
    const after = Order.reconstitute(
      2,
      1,
      1,
      OrderStatus.create(OrderStatusMap.SHIPPED),
      createdAt,
      createdAt,
    );
    expect(() => OrderHistory.recordTransition(null, before, after)).toThrow(
      ValidationError,
    );
  });
});
