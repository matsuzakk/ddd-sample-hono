import { describe, expect, it } from "vitest";
import { ItemStatusMap } from "../../domain/model/item/ItemStatus.js";
import { withMemoryAppDatabase } from "../../infrastructure/database/test/testDb.js";
import { items, users } from "../../infrastructure/database/schema.js";
import { getItemAllListUsecase } from "./getItemAllListUsecase.js";

describe("getItemAllList", () => {
  it("テーブルが空なら空配列", () => {
    withMemoryAppDatabase((db) => {
      expect(getItemAllListUsecase({ db })).toEqual([]);
    });
  });

  it("全行を ItemDto の配列で返す", () => {
    withMemoryAppDatabase((db) => {
      const s1 = db
        .insert(users)
        .values({ name: "a", email: "a-all@example.com" })
        .returning({ id: users.id })
        .all()[0]!;
      const s2 = db
        .insert(users)
        .values({ name: "b", email: "b-all@example.com" })
        .returning({ id: users.id })
        .all()[0]!;
      const s3 = db
        .insert(users)
        .values({ name: "c", email: "c-all@example.com" })
        .returning({ id: users.id })
        .all()[0]!;
      db.insert(items)
        .values([
          {
            name: "One",
            description: "d1",
            price: 0,
            status: ItemStatusMap.SELLABLE,
            sellerId: s1.id,
            createdAt: new Date("2024-03-01T00:00:00.000Z"),
            updatedAt: new Date("2024-03-02T00:00:00.000Z"),
          },
          {
            name: "Two",
            description: "d2",
            price: 999_999,
            status: ItemStatusMap.SELLABLE,
            sellerId: s2.id,
            createdAt: new Date("2024-03-01T00:00:00.000Z"),
            updatedAt: new Date("2024-03-02T00:00:00.000Z"),
          },
          {
            name: "Three",
            description: "d3",
            price: 1_000_000,
            status: ItemStatusMap.PURCHASED,
            sellerId: s3.id,
            createdAt: new Date("2024-03-01T00:00:00.000Z"),
            updatedAt: new Date("2024-03-02T00:00:00.000Z"),
          },
        ])
        .run();

      const list = getItemAllListUsecase({ db });
      expect(list).toHaveLength(2);
      expect(list.map((x) => x.name).sort()).toEqual(["One", "Two"]);
    });
  });
});
