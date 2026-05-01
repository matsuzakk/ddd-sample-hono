import { describe, expect, it } from "vitest";
import { withMemoryAppDatabase } from "../../infrastructure/database/test/testDb.js";
import { items, orders, users } from "../../infrastructure/database/schema.js";
import { getOrderListUsecase } from "./getOrderListUsecase.js";

describe("getOrderList", () => {
  it("userId が一致する注文だけを返す", () => {
    withMemoryAppDatabase((db) => {
      const u1 = db
        .insert(users)
        .values({ name: "u1", email: "u1-list@example.com" })
        .returning({ id: users.id })
        .all()[0]!;
      const u2 = db
        .insert(users)
        .values({ name: "u2", email: "u2-list@example.com" })
        .returning({ id: users.id })
        .all()[0]!;
      const i1 = db
        .insert(items)
        .values({
          name: "i1",
          description: "d",
          price: 1,
          status: 0,
          sellerId: u1.id,
          createdAt: new Date("2024-04-01T00:00:00.000Z"),
          updatedAt: new Date("2024-04-02T00:00:00.000Z"),
        })
        .returning({ id: items.id })
        .all()[0]!;
      const i2 = db
        .insert(items)
        .values({
          name: "i2",
          description: "d",
          price: 1,
          status: 0,
          sellerId: u1.id,
          createdAt: new Date("2024-04-01T00:00:00.000Z"),
          updatedAt: new Date("2024-04-02T00:00:00.000Z"),
        })
        .returning({ id: items.id })
        .all()[0]!;
      const i3 = db
        .insert(items)
        .values({
          name: "i3",
          description: "d",
          price: 1,
          status: 0,
          sellerId: u1.id,
          createdAt: new Date("2024-04-01T00:00:00.000Z"),
          updatedAt: new Date("2024-04-02T00:00:00.000Z"),
        })
        .returning({ id: items.id })
        .all()[0]!;

      db.insert(orders)
        .values([
          {
            userId: u1.id,
            itemId: i1.id,
            status: 0,
            createdAt: new Date("2024-04-01T00:00:00.000Z"),
            updatedAt: new Date("2024-04-02T00:00:00.000Z"),
          },
          {
            userId: u2.id,
            itemId: i2.id,
            status: 1,
            createdAt: new Date("2024-04-01T00:00:00.000Z"),
            updatedAt: new Date("2024-04-02T00:00:00.000Z"),
          },
          {
            userId: u1.id,
            itemId: i3.id,
            status: 2,
            createdAt: new Date("2024-04-01T00:00:00.000Z"),
            updatedAt: new Date("2024-04-02T00:00:00.000Z"),
          },
        ])
        .run();

      const list = getOrderListUsecase({ db }, { userId: u1.id });
      expect(list).toHaveLength(2);
      expect(list.every((x) => x.userId === u1.id)).toBe(true);
      expect(list.map((x) => x.itemId).sort((a, b) => a - b)).toEqual(
        [i1.id, i3.id].sort((a, b) => a - b),
      );
    });
  });

  it("一致する行がなければ空配列", () => {
    withMemoryAppDatabase((db) => {
      expect(getOrderListUsecase({ db }, { userId: 9_999_999 })).toEqual([]);
    });
  });
});
