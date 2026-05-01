import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../domain/model/shared/error.js";
import { withMemoryAppDatabase } from "../../infrastructure/database/test/testDb.js";
import { items, users } from "../../infrastructure/database/schema.js";
import { getItemDetailUsecase } from "./getItemDetailUsecase.js";

describe("getItemDetail", () => {
  it("該当行がないとき NotFoundError を投げる", () => {
    withMemoryAppDatabase((db) => {
      expect(() => getItemDetailUsecase({ db }, { itemId: 9_999_999 })).toThrow(
        NotFoundError,
      );
    });
  });

  it("該当行があるとき ItemDto を返す", () => {
    withMemoryAppDatabase((db) => {
      const seller = db
        .insert(users)
        .values({ name: "s", email: "seller-detail@example.com" })
        .returning({ id: users.id })
        .all()[0]!;
      db.insert(items)
        .values({
          name: "Sample product",
          description: "A short description",
          price: 12_345,
          status: 0,
          sellerId: seller.id,
          createdAt: new Date("2024-06-01T00:00:00.000Z"),
          updatedAt: new Date("2024-06-02T00:00:00.000Z"),
        })
        .run();

      const item = db.select({ id: items.id }).from(items).limit(1).all()[0]!;

      const result = getItemDetailUsecase({ db }, { itemId: item.id });
      expect(result).toEqual({
        id: item.id,
        name: "Sample product",
        description: "A short description",
        price: 12_345,
        status: 0,
        sellerId: seller.id,
        createdAt: new Date("2024-06-01T00:00:00.000Z"),
        updatedAt: new Date("2024-06-02T00:00:00.000Z"),
      });
    });
  });
});
