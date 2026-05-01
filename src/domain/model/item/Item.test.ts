import { describe, expect, it, vi } from "vitest";
import { Item } from "./Item.js";
import { ItemDescription } from "./vo/ItemDescription.js";
import { ItemName } from "./vo/ItemName.js";
import { ItemPrice } from "./vo/ItemPrice.js";
import { ItemStatus, ItemStatusMap } from "./vo/ItemStatus.js";

const baseDates = () => ({
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-02T00:00:00.000Z"),
});

describe("Item", () => {
  it("create: SELLABLE で新規商品を返し createdAt と updatedAt が一致する", () => {
    const price = ItemPrice.create(1000);
    const item = Item.create("Name", "Description", price, 1);
    expect(item.id).toBeNull();
    expect(ItemName.toValue(item.name)).toBe("Name");
    expect(ItemDescription.toValue(item.description)).toBe("Description");
    expect(ItemPrice.toValue(item.price)).toBe(1000);
    expect(item.sellerId).toBe(1);
    expect(Item.isSellable(item)).toBe(true);
    expect(item.createdAt).toEqual(item.updatedAt);
  });

  it("reconstitute: id・日付・ステータスをそのまま保持する", () => {
    const { createdAt, updatedAt } = baseDates();
    const price = ItemPrice.create(1);
    const status = ItemStatus.create(ItemStatusMap.PURCHASED);
    const item = Item.reconstitute(
      99,
      "n",
      "d",
      price,
      status,
      2,
      createdAt,
      updatedAt,
    );
    expect(item.id).toBe(99);
    expect(Item.isPurchased(item)).toBe(true);
    expect(item.sellerId).toBe(2);
    expect(item.createdAt).toBe(createdAt);
    expect(item.updatedAt).toBe(updatedAt);
  });

  it("isPurchasableByUser: 出品者自身を拒否する", () => {
    const item = Item.create("n", "d", ItemPrice.create(0), 1);
    expect(Item.isPurchasableByUser(item, 1)).toBe(false);
    expect(Item.isPurchasableByUser(item, 2)).toBe(true);
  });

  it("isSeller: 販売者 id と一致すると true", () => {
    const item = Item.create("n", "d", ItemPrice.create(0), 10);
    expect(Item.isSeller(item, 10)).toBe(true);
    expect(Item.isSeller(item, 11)).toBe(false);
  });

  it("changeStatus: ステータスと updatedAt を更新する", () => {
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

  it("changeName: nameとupdatedAtを更新する", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
    const item = Item.create("n", "d", ItemPrice.create(0), 1);
    vi.setSystemTime(new Date("2025-01-01T01:00:00.000Z"));
    const renamed = Item.changeName(item, "New");
    expect(ItemName.toValue(renamed.name)).toBe("New");
    expect(renamed.updatedAt.getTime()).toBeGreaterThan(
      item.updatedAt.getTime(),
    );
    vi.useRealTimers();
  });

  it("changeDescription: descriptionとupdatedAtを更新する", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
    const item = Item.create("n", "d", ItemPrice.create(0), 1);
    vi.setSystemTime(new Date("2025-01-01T02:00:00.000Z"));
    const redescribed = Item.changeDescription(item, "Longer text");
    expect(ItemDescription.toValue(redescribed.description)).toBe(
      "Longer text",
    );
    expect(redescribed.updatedAt.getTime()).toBeGreaterThan(
      item.updatedAt.getTime(),
    );
    vi.useRealTimers();
  });

  it("changePrice: priceとupdatedAtを更新する", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
    const item = Item.create("n", "d", ItemPrice.create(0), 1);
    vi.setSystemTime(new Date("2025-01-01T03:00:00.000Z"));
    const repriced = Item.changePrice(item, ItemPrice.create(500));
    expect(ItemPrice.toValue(repriced.price)).toBe(500);
    expect(repriced.updatedAt.getTime()).toBeGreaterThan(
      item.updatedAt.getTime(),
    );
    vi.useRealTimers();
  });
});
