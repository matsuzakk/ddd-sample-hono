import { describe, expect, it } from "vitest";
import { withMemoryAppDatabase } from "../../infrastructure/database/test/testDb.js";
import {
  orderHistories,
  orders,
} from "../../infrastructure/database/schema.js";
import { getOrderDetail } from "./getOrderDetail.js";

describe("getOrderDetail", () => {
  it("注文がないとき order は null、histories は空", () => {
    withMemoryAppDatabase((db) => {
      const result = getOrderDetail({ db }, { orderId: "missing" });
      expect(result.order).toBeNull();
      expect(result.histories).toEqual([]);
    });
  });

  it("注文と履歴を返す", () => {
    withMemoryAppDatabase((db) => {
      db.insert(orders)
        .values({
          id: "order-1",
          userId: "buyer",
          itemId: "item-1",
          status: 1,
          createdAt: new Date("2024-05-01T00:00:00.000Z"),
          updatedAt: new Date("2024-05-02T00:00:00.000Z"),
        })
        .run();
      db.insert(orderHistories)
        .values([
          {
            id: "h1",
            orderId: "order-1",
            fromStatus: null,
            toStatus: 0,
            createdAt: new Date("2024-05-01T00:00:00.000Z"),
          },
          {
            id: "h2",
            orderId: "order-1",
            fromStatus: 0,
            toStatus: 1,
            createdAt: new Date("2024-05-03T00:00:00.000Z"),
          },
        ])
        .run();

      const { order, histories } = getOrderDetail(
        { db },
        {
          orderId: "order-1",
        },
      );
      expect(order).toEqual({
        id: "order-1",
        userId: "buyer",
        itemId: "item-1",
        status: 1,
        createdAt: new Date("2024-05-01T00:00:00.000Z"),
        updatedAt: new Date("2024-05-02T00:00:00.000Z"),
      });
      expect(histories).toHaveLength(2);
      const byId = new Map(histories.map((h) => [h.id, h]));
      expect(byId.get("h1")).toEqual({
        id: "h1",
        orderId: "order-1",
        fromStatus: null,
        toStatus: 0,
        createdAt: new Date("2024-05-01T00:00:00.000Z"),
      });
      expect(byId.get("h2")).toEqual({
        id: "h2",
        orderId: "order-1",
        fromStatus: 0,
        toStatus: 1,
        createdAt: new Date("2024-05-03T00:00:00.000Z"),
      });
    });
  });

  it("注文はあるが履歴がないとき histories は空", () => {
    withMemoryAppDatabase((db) => {
      db.insert(orders)
        .values({
          id: "order-x",
          userId: "u",
          itemId: "i",
          status: 0,
          createdAt: new Date("2024-05-01T00:00:00.000Z"),
          updatedAt: new Date("2024-05-01T00:00:00.000Z"),
        })
        .run();

      const { order, histories } = getOrderDetail(
        { db },
        {
          orderId: "order-x",
        },
      );
      expect(order?.id).toBe("order-x");
      expect(histories).toEqual([]);
    });
  });
});
