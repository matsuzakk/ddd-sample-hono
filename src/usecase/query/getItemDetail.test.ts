import { describe, expect, it } from "vitest";
import { withMemoryAppDatabase } from "../../infrastructure/database/test/testDb.js";
import { items } from "../../infrastructure/database/schema.js";
import { getItemDetail } from "./getItemDetail.js";

describe("getItemDetail", () => {
  it("該当行がないとき null を返す", () => {
    withMemoryAppDatabase((db) => {
      const result = getItemDetail({ db }, { itemId: "missing" });
      expect(result).toBeNull();
    });
  });

  it("該当行があるとき ItemDto を返す", () => {
    withMemoryAppDatabase((db) => {
      db.insert(items)
        .values({
          id: "item-1",
          name: "Sample product",
          description: "A short description",
          price: 12_345,
          status: 0,
          sellerId: "seller-1",
          createdAt: new Date("2024-06-01T00:00:00.000Z"),
          updatedAt: new Date("2024-06-02T00:00:00.000Z"),
        })
        .run();

      const result = getItemDetail({ db }, { itemId: "item-1" });
      expect(result).toEqual({
        id: "item-1",
        name: "Sample product",
        description: "A short description",
        price: 12_345,
        status: 0,
        sellerId: "seller-1",
        createdAt: new Date("2024-06-01T00:00:00.000Z"),
        updatedAt: new Date("2024-06-02T00:00:00.000Z"),
      });
    });
  });
});
