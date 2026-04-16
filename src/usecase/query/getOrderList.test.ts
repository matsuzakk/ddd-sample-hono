import { describe, expect, it } from "vitest";
import { withMemoryAppDatabase } from "../../infrastructure/database/test/testDb.js";
import { orders } from "../../infrastructure/database/schema.js";
import { getOrderList } from "./getOrderList.js";

describe("getOrderList", () => {
  it("userId が一致する注文だけを返す", () => {
    withMemoryAppDatabase((db) => {
      db.insert(orders)
        .values([
          {
            id: "o1",
            userId: "u1",
            itemId: "i1",
            status: 0,
            createdAt: new Date("2024-04-01T00:00:00.000Z"),
            updatedAt: new Date("2024-04-02T00:00:00.000Z"),
          },
          {
            id: "o2",
            userId: "u2",
            itemId: "i2",
            status: 1,
            createdAt: new Date("2024-04-01T00:00:00.000Z"),
            updatedAt: new Date("2024-04-02T00:00:00.000Z"),
          },
          {
            id: "o3",
            userId: "u1",
            itemId: "i3",
            status: 2,
            createdAt: new Date("2024-04-01T00:00:00.000Z"),
            updatedAt: new Date("2024-04-02T00:00:00.000Z"),
          },
        ])
        .run();

      const list = getOrderList({ db }, { userId: "u1" });
      expect(list).toHaveLength(2);
      expect(list.map((x) => x.id).sort()).toEqual(["o1", "o3"]);
      expect(list.every((x) => x.userId === "u1")).toBe(true);
    });
  });

  it("一致する行がなければ空配列", () => {
    withMemoryAppDatabase((db) => {
      expect(getOrderList({ db }, { userId: "ghost" })).toEqual([]);
    });
  });
});
