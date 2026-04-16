import { describe, expect, it } from "vitest";
import { ValidationError } from "../shared/error.js";
import { OrderStatus, OrderStatusMap } from "./OrderStatus.js";

describe("OrderStatus", () => {
  it("create は定義済みの値を受け入れる", () => {
    const purchased = OrderStatus.create(OrderStatusMap.PURCHASED);
    expect(OrderStatus.toValue(purchased)).toBe(OrderStatusMap.PURCHASED);
  });

  it("reconstitute は定義済みの数値を復元する", () => {
    const shipped = OrderStatus.reconstitute(OrderStatusMap.SHIPPED);
    expect(OrderStatus.isShipped(shipped)).toBe(true);
  });

  it("reconstitute は未知の値で ValidationError を投げる", () => {
    expect(() => OrderStatus.reconstitute(42)).toThrow(ValidationError);
  });

  it("各 isXxx は状態を判定する", () => {
    const p = OrderStatus.create(OrderStatusMap.PURCHASED);
    const s = OrderStatus.create(OrderStatusMap.SHIPPED);
    const d = OrderStatus.create(OrderStatusMap.DELIVERED);
    const c = OrderStatus.create(OrderStatusMap.CANCELED);
    expect(OrderStatus.isPurchased(p)).toBe(true);
    expect(OrderStatus.isShipped(s)).toBe(true);
    expect(OrderStatus.isDelivered(d)).toBe(true);
    expect(OrderStatus.isCanceled(c)).toBe(true);
    expect(OrderStatus.isShipped(p)).toBe(false);
    expect(OrderStatus.isDelivered(p)).toBe(false);
  });

  it("equals は同一の列挙値なら true", () => {
    const a = OrderStatus.create(OrderStatusMap.PURCHASED);
    const b = OrderStatus.create(OrderStatusMap.PURCHASED);
    expect(OrderStatus.equals(a, b)).toBe(true);
    expect(
      OrderStatus.equals(a, OrderStatus.create(OrderStatusMap.SHIPPED)),
    ).toBe(false);
  });
});
