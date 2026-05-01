import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "../shared/error.js";
import { ItemDescription } from "./ItemDescription.js";
import { Item } from "./Item.js";
import { ItemName } from "./ItemName.js";
import { ItemPrice } from "./ItemPrice.js";
import { ItemStatus, ItemStatusMap } from "./ItemStatus.js";

const baseDates = () => {
  const createdAt = new Date("2024-01-01T00:00:00.000Z");
  const updatedAt = new Date("2024-01-02T00:00:00.000Z");
  return { createdAt, updatedAt };
};

describe("Item", () => {
  it("create は SELLABLE で商品を返す", () => {
    const price = ItemPrice.create(1000);
    const item = Item.create("Name", "Description", price, 1);
    expect(item.id).toBeNull();
    expect(ItemName.toValue(item.name)).toBe("Name");
    expect(ItemDescription.toValue(item.description)).toBe("Description");
    expect(ItemPrice.toValue(item.price)).toBe(1000);
    expect(item.sellerId).toBe(1);
    expect(ItemStatus.isSellable(item.status)).toBe(true);
    expect(item.createdAt).toEqual(item.updatedAt);
  });

  it("create は無効な名前で ValidationError を投げる", () => {
    const price = ItemPrice.create(0);
    expect(() => Item.create("", "d", price, 1)).toThrow(ValidationError);
    expect(() => Item.create("a".repeat(21), "d", price, 1)).toThrow(
      ValidationError,
    );
  });

  it("create は無効な説明で ValidationError を投げる", () => {
    const price = ItemPrice.create(0);
    expect(() => Item.create("n", "", price, 1)).toThrow(ValidationError);
    expect(() => Item.create("n", "x".repeat(1001), price, 1)).toThrow(
      ValidationError,
    );
  });

  it("reconstitute は名前・説明の長さを検証しない", () => {
    const { createdAt, updatedAt } = baseDates();
    const price = ItemPrice.create(1);
    const status = ItemStatus.create(ItemStatusMap.SELLABLE);
    const item = Item.reconstitute(
      1,
      "",
      "",
      price,
      status,
      1,
      createdAt,
      updatedAt,
    );
    expect(ItemName.toValue(item.name)).toBe("");
    expect(ItemDescription.toValue(item.description)).toBe("");
  });

  it("isPurchased / isSellable はステータスを委譲する", () => {
    const price = ItemPrice.create(0);
    const { createdAt, updatedAt } = baseDates();
    const sellable = Item.reconstitute(
      1,
      "n",
      "d",
      price,
      ItemStatus.create(ItemStatusMap.SELLABLE),
      1,
      createdAt,
      updatedAt,
    );
    const purchased = Item.reconstitute(
      2,
      "n",
      "d",
      price,
      ItemStatus.create(ItemStatusMap.PURCHASED),
      1,
      createdAt,
      updatedAt,
    );
    expect(Item.isSellable(sellable)).toBe(true);
    expect(Item.isPurchased(sellable)).toBe(false);
    expect(Item.isPurchased(purchased)).toBe(true);
  });

  it("isPurchasableByUser は出品者自身の購入を拒否する", () => {
    const item = Item.create("n", "d", ItemPrice.create(0), 1);
    expect(Item.isPurchasableByUser(item, 1)).toBe(false);
    expect(Item.isPurchasableByUser(item, 2)).toBe(true);
  });

  it("isSeller は販売者と一致すると true", () => {
    const item = Item.create("n", "d", ItemPrice.create(0), 10);
    expect(Item.isSeller(item, 10)).toBe(true);
  });

  it("isSeller は販売者と一致しないと false", () => {
    const item = Item.create("n", "d", ItemPrice.create(0), 10);
    expect(Item.isSeller(item, 99)).toBe(false);
  });

  it("changeStatus はステータスと updatedAt を更新する", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T12:00:00.000Z"));
    const item = Item.create("n", "d", ItemPrice.create(0), 1);
    const frozen = item.updatedAt.getTime();
    vi.setSystemTime(new Date("2025-06-01T12:00:01.000Z"));
    const next = ItemStatus.create(ItemStatusMap.PURCHASED);
    const updated = Item.changeStatus(item, next);
    expect(updated.status).toBe(next);
    expect(updated.updatedAt.getTime()).toBeGreaterThan(frozen);
    vi.useRealTimers();
  });

  it("changeName / changeDescription / changePrice は不変条件を検証する", () => {
    const item = Item.create("n", "d", ItemPrice.create(0), 1);
    expect(() => Item.changeName(item, "")).toThrow(ValidationError);
    expect(() => Item.changeDescription(item, "")).toThrow(ValidationError);
    const renamed = Item.changeName(item, "New");
    expect(ItemName.toValue(renamed.name)).toBe("New");
    const redescribed = Item.changeDescription(renamed, "Longer text");
    expect(ItemDescription.toValue(redescribed.description)).toBe("Longer text");
    const repriced = Item.changePrice(redescribed, ItemPrice.create(999));
    expect(ItemPrice.toValue(repriced.price)).toBe(999);
  });
});
