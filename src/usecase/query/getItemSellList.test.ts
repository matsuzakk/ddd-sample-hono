import { describe, expect, it } from "vitest";
import { withMemoryAppDatabase } from "../../infrastructure/database/test/testDb.js";
import { items } from "../../infrastructure/database/schema.js";
import { getItemSellList } from "./getItemSellList.js";

describe("getItemSellList", () => {
  it("sellerId が一致する商品だけを返す", () => {
    withMemoryAppDatabase((db) => {
      db.insert(items)
        .values([
          {
            id: "a",
            name: "For Alice",
            description: "d",
            price: 100,
            status: 0,
            sellerId: "alice",
            createdAt: new Date("2024-01-01T00:00:00.000Z"),
            updatedAt: new Date("2024-01-02T00:00:00.000Z"),
          },
          {
            id: "b",
            name: "Bob only",
            description: "d",
            price: 200,
            status: 1,
            sellerId: "bob",
            createdAt: new Date("2024-01-01T00:00:00.000Z"),
            updatedAt: new Date("2024-01-02T00:00:00.000Z"),
          },
          {
            id: "c",
            name: "Alice two",
            description: "d",
            price: 300,
            status: 0,
            sellerId: "alice",
            createdAt: new Date("2024-01-01T00:00:00.000Z"),
            updatedAt: new Date("2024-01-02T00:00:00.000Z"),
          },
        ])
        .run();

      const list = getItemSellList({ db }, { sellerId: "alice" });
      expect(list).toHaveLength(2);
      expect(list.map((x) => x.id).sort()).toEqual(["a", "c"]);
      expect(list.every((x) => x.sellerId === "alice")).toBe(true);
    });
  });

  it("一致する行がなければ空配列", () => {
    withMemoryAppDatabase((db) => {
      expect(getItemSellList({ db }, { sellerId: "nobody" })).toEqual([]);
    });
  });
});
