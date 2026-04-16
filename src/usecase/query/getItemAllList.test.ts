import { describe, expect, it } from "vitest";
import { withMemoryAppDatabase } from "../../infrastructure/database/test/testDb.js";
import { items } from "../../infrastructure/database/schema.js";
import { getItemAllList } from "./getItemAllList.js";

describe("getItemAllList", () => {
  it("テーブルが空なら空配列", () => {
    withMemoryAppDatabase((db) => {
      expect(getItemAllList({ db })).toEqual([]);
    });
  });

  it("全行を ItemDto の配列で返す", () => {
    withMemoryAppDatabase((db) => {
      db.insert(items)
        .values([
          {
            id: "i1",
            name: "One",
            description: "d1",
            price: 0,
            status: 0,
            sellerId: "s1",
            createdAt: new Date("2024-03-01T00:00:00.000Z"),
            updatedAt: new Date("2024-03-02T00:00:00.000Z"),
          },
          {
            id: "i2",
            name: "Two",
            description: "d2",
            price: 999_999,
            status: 1,
            sellerId: "s2",
            createdAt: new Date("2024-03-01T00:00:00.000Z"),
            updatedAt: new Date("2024-03-02T00:00:00.000Z"),
          },
        ])
        .run();

      const list = getItemAllList({ db });
      expect(list).toHaveLength(2);
      expect(list.map((x) => x.id).sort()).toEqual(["i1", "i2"]);
    });
  });
});
