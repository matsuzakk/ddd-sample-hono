import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../domain/model/shared/error.js";
import { withMemoryAppDatabase } from "../../infrastructure/database/test/testDb.js";
import {
  items,
  orderHistories,
  orders,
  users,
} from "../../infrastructure/database/schema.js";
import { getOrderDetailUsecase } from "./getOrderDetailUsecase.js";

describe("getOrderDetail", () => {
  it("注文がないとき NotFoundError を投げる", () => {
    withMemoryAppDatabase((db) => {
      expect(() =>
        getOrderDetailUsecase({ db }, { orderId: 9_999_999 }),
      ).toThrow(NotFoundError);
    });
  });

  it("注文と履歴を返す", () => {
    withMemoryAppDatabase((db) => {
      const buyer = db
        .insert(users)
        .values({ name: "b", email: "buyer-detail@example.com" })
        .returning({ id: users.id })
        .all()[0]!;
      const seller = db
        .insert(users)
        .values({ name: "s", email: "seller-detail@example.com" })
        .returning({ id: users.id })
        .all()[0]!;
      const item = db
        .insert(items)
        .values({
          name: "i",
          description: "d",
          price: 1,
          status: 0,
          sellerId: seller.id,
          createdAt: new Date("2024-05-01T00:00:00.000Z"),
          updatedAt: new Date("2024-05-01T00:00:00.000Z"),
        })
        .returning({ id: items.id })
        .all()[0]!;
      const orderRow = db
        .insert(orders)
        .values({
          userId: buyer.id,
          itemId: item.id,
          status: 1,
          createdAt: new Date("2024-05-01T00:00:00.000Z"),
          updatedAt: new Date("2024-05-02T00:00:00.000Z"),
        })
        .returning({ id: orders.id })
        .all()[0]!;

      db.insert(orderHistories)
        .values([
          {
            orderId: orderRow.id,
            fromStatus: null,
            toStatus: 0,
            createdAt: new Date("2024-05-01T00:00:00.000Z"),
          },
          {
            orderId: orderRow.id,
            fromStatus: 0,
            toStatus: 1,
            createdAt: new Date("2024-05-03T00:00:00.000Z"),
          },
        ])
        .run();

      const { order, histories } = getOrderDetailUsecase(
        { db },
        {
          orderId: orderRow.id,
        },
      );
      expect(order).toEqual({
        id: orderRow.id,
        userId: buyer.id,
        itemId: item.id,
        status: 1,
        createdAt: new Date("2024-05-01T00:00:00.000Z"),
        updatedAt: new Date("2024-05-02T00:00:00.000Z"),
      });
      expect(histories).toHaveLength(2);
      expect(histories.every((h) => h.orderId === orderRow.id)).toBe(true);
      expect(histories.map((h) => h.toStatus).sort()).toEqual([0, 1]);
    });
  });

  it("注文はあるが履歴がないとき histories は空", () => {
    withMemoryAppDatabase((db) => {
      const buyer = db
        .insert(users)
        .values({ name: "u", email: "u-detail@example.com" })
        .returning({ id: users.id })
        .all()[0]!;
      const seller = db
        .insert(users)
        .values({ name: "s2", email: "s2-detail@example.com" })
        .returning({ id: users.id })
        .all()[0]!;
      const item = db
        .insert(items)
        .values({
          name: "i",
          description: "d",
          price: 1,
          status: 0,
          sellerId: seller.id,
          createdAt: new Date("2024-05-01T00:00:00.000Z"),
          updatedAt: new Date("2024-05-01T00:00:00.000Z"),
        })
        .returning({ id: items.id })
        .all()[0]!;
      const orderRow = db
        .insert(orders)
        .values({
          userId: buyer.id,
          itemId: item.id,
          status: 0,
          createdAt: new Date("2024-05-01T00:00:00.000Z"),
          updatedAt: new Date("2024-05-01T00:00:00.000Z"),
        })
        .returning({ id: orders.id })
        .all()[0]!;

      const { order, histories } = getOrderDetailUsecase(
        { db },
        {
          orderId: orderRow.id,
        },
      );
      expect(order?.id).toBe(orderRow.id);
      expect(histories).toEqual([]);
    });
  });
});
