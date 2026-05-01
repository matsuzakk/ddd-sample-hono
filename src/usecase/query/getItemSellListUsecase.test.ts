import { describe, expect, it } from "vitest";
import { withMemoryAppDatabase } from "../../infrastructure/database/test/testDb.js";
import { items, users } from "../../infrastructure/database/schema.js";
import { getItemSellListUsecase } from "./getItemSellListUsecase.js";

describe("getItemSellList", () => {
  it("sellerId が一致する商品だけを返す", () => {
    withMemoryAppDatabase((db) => {
      const alice = db
        .insert(users)
        .values({ name: "Alice", email: "alice-sell@example.com" })
        .returning({ id: users.id })
        .all()[0]!;
      const bob = db
        .insert(users)
        .values({ name: "Bob", email: "bob-sell@example.com" })
        .returning({ id: users.id })
        .all()[0]!;
      db.insert(items)
        .values([
          {
            name: "For Alice",
            description: "d",
            price: 100,
            status: 0,
            sellerId: alice.id,
            createdAt: new Date("2024-01-01T00:00:00.000Z"),
            updatedAt: new Date("2024-01-02T00:00:00.000Z"),
          },
          {
            name: "Bob only",
            description: "d",
            price: 200,
            status: 1,
            sellerId: bob.id,
            createdAt: new Date("2024-01-01T00:00:00.000Z"),
            updatedAt: new Date("2024-01-02T00:00:00.000Z"),
          },
          {
            name: "Alice two",
            description: "d",
            price: 300,
            status: 0,
            sellerId: alice.id,
            createdAt: new Date("2024-01-01T00:00:00.000Z"),
            updatedAt: new Date("2024-01-02T00:00:00.000Z"),
          },
        ])
        .run();

      const list = getItemSellListUsecase({ db }, { sellerId: alice.id });
      expect(list).toHaveLength(2);
      expect(list.every((x) => x.sellerId === alice.id)).toBe(true);
    });
  });

  it("一致する行がなければ空配列", () => {
    withMemoryAppDatabase((db) => {
      expect(getItemSellListUsecase({ db }, { sellerId: 9_999_999 })).toEqual(
        [],
      );
    });
  });
});
