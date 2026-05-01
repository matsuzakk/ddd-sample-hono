import { describe, expect, it } from "vitest";
import { ValidationError } from "../../shared/error.js";
import { OrderStatus, OrderStatusMap } from "./OrderStatus.js";

describe("OrderStatus", () => {
  it("Zod: 0〜3 の列挙値のみ create で受理される", () => {
    expect(
      OrderStatus.toValue(OrderStatus.create(OrderStatusMap.PURCHASED)),
    ).toBe(OrderStatusMap.PURCHASED);
    expect(
      OrderStatus.toValue(OrderStatus.create(OrderStatusMap.SHIPPED)),
    ).toBe(OrderStatusMap.SHIPPED);
    expect(
      OrderStatus.toValue(OrderStatus.create(OrderStatusMap.DELIVERED)),
    ).toBe(OrderStatusMap.DELIVERED);
    expect(
      OrderStatus.toValue(OrderStatus.create(OrderStatusMap.CANCELED)),
    ).toBe(OrderStatusMap.CANCELED);
  });

  it("Zod: 範囲外の number は ValidationError", () => {
    expect(() => OrderStatus.create(99)).toThrow(ValidationError);
  });

  it("各フラグ関数が状態と一致する", () => {
    expect(
      OrderStatus.isPurchased(
        OrderStatus.create(OrderStatusMap.PURCHASED),
      ),
    ).toBe(true);
    expect(
      OrderStatus.isShipped(OrderStatus.create(OrderStatusMap.SHIPPED)),
    ).toBe(true);
    expect(
      OrderStatus.isDelivered(OrderStatus.create(OrderStatusMap.DELIVERED)),
    ).toBe(true);
    expect(
      OrderStatus.isCanceled(OrderStatus.create(OrderStatusMap.CANCELED)),
    ).toBe(true);
  });
});
