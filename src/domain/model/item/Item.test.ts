import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "../shared/error.js";
import { Item } from "./Item.js";
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
    const item = Item.create(
      "item-1",
      "Name",
      "Description",
      price,
      "seller-1",
    );
    expect(item.id).toBe("item-1");
    expect(item.name).toBe("Name");
    expect(item.description).toBe("Description");
    expect(ItemPrice.toValue(item.price)).toBe(1000);
    expect(item.sellerId).toBe("seller-1");
    expect(ItemStatus.isSellable(item.status)).toBe(true);
    expect(item.createdAt).toEqual(item.updatedAt);
  });

  it("create は無効な名前で ValidationError を投げる", () => {
    const price = ItemPrice.create(0);
    expect(() =>
      Item.create("id", "", "d", price, "seller"),
    ).toThrow(ValidationError);
    expect(() =>
      Item.create("id", "a".repeat(21), "d", price, "seller"),
    ).toThrow(ValidationError);
  });

  it("create は無効な説明で ValidationError を投げる", () => {
    const price = ItemPrice.create(0);
    expect(() =>
      Item.create("id", "n", "", price, "seller"),
    ).toThrow(ValidationError);
    expect(() =>
      Item.create("id", "n", "x".repeat(1001), price, "seller"),
    ).toThrow(ValidationError);
  });

  it("reconstitute は名前・説明の長さを検証しない", () => {
    const { createdAt, updatedAt } = baseDates();
    const price = ItemPrice.create(1);
    const status = ItemStatus.create(ItemStatusMap.SELLABLE);
    const item = Item.reconstitute(
      "id",
      "",
      "",
      price,
      status,
      "seller",
      createdAt,
      updatedAt,
    );
    expect(item.name).toBe("");
    expect(item.description).toBe("");
  });

  it("isPurchased / isSellable はステータスを委譲する", () => {
    const price = ItemPrice.create(0);
    const { createdAt, updatedAt } = baseDates();
    const sellable = Item.reconstitute(
      "i",
      "n",
      "d",
      price,
      ItemStatus.create(ItemStatusMap.SELLABLE),
      "s",
      createdAt,
      updatedAt,
    );
    const purchased = Item.reconstitute(
      "i2",
      "n",
      "d",
      price,
      ItemStatus.create(ItemStatusMap.PURCHASED),
      "s",
      createdAt,
      updatedAt,
    );
    expect(Item.isSellable(sellable)).toBe(true);
    expect(Item.isPurchased(sellable)).toBe(false);
    expect(Item.isPurchased(purchased)).toBe(true);
  });

  it("isPurchasableByUser は出品者自身の購入を拒否する", () => {
    const item = Item.create("i", "n", "d", ItemPrice.create(0), "seller");
    expect(Item.isPurchasableByUser(item, "seller")).toBe(false);
    expect(Item.isPurchasableByUser(item, "buyer")).toBe(true);
  });

  it("changeStatus はステータスと updatedAt を更新する", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01T12:00:00.000Z"));
    const item = Item.create("i", "n", "d", ItemPrice.create(0), "s");
    const frozen = item.updatedAt.getTime();
    vi.setSystemTime(new Date("2025-06-01T12:00:01.000Z"));
    const next = ItemStatus.create(ItemStatusMap.PURCHASED);
    const updated = Item.changeStatus(item, next);
    expect(updated.status).toBe(next);
    expect(updated.updatedAt.getTime()).toBeGreaterThan(frozen);
    vi.useRealTimers();
  });

  it("changeName / changeDescription / changePrice は不変条件を検証する", () => {
    const item = Item.create("i", "n", "d", ItemPrice.create(0), "s");
    expect(() => Item.changeName(item, "")).toThrow(ValidationError);
    expect(() => Item.changeDescription(item, "")).toThrow(ValidationError);
    const renamed = Item.changeName(item, "New");
    expect(renamed.name).toBe("New");
    const redescribed = Item.changeDescription(renamed, "Longer text");
    expect(redescribed.description).toBe("Longer text");
    const repriced = Item.changePrice(redescribed, ItemPrice.create(999));
    expect(ItemPrice.toValue(repriced.price)).toBe(999);
  });
});
