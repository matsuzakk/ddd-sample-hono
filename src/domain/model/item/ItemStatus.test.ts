import { describe, expect, it } from "vitest";
import { ValidationError } from "../shared/error.js";
import { ItemStatus, ItemStatusMap } from "./ItemStatus.js";

describe("ItemStatus", () => {
  it("create は定義済みの値を受け入れる", () => {
    const sellable = ItemStatus.create(ItemStatusMap.SELLABLE);
    const purchased = ItemStatus.create(ItemStatusMap.PURCHASED);
    expect(ItemStatus.toValue(sellable)).toBe(ItemStatusMap.SELLABLE);
    expect(ItemStatus.toValue(purchased)).toBe(ItemStatusMap.PURCHASED);
  });

  it("reconstitute は定義済みの数値を復元する", () => {
    const s = ItemStatus.reconstitute(ItemStatusMap.PURCHASED);
    expect(ItemStatus.isPurchased(s)).toBe(true);
  });

  it("reconstitute は未知の値で ValidationError を投げる", () => {
    expect(() => ItemStatus.reconstitute(99)).toThrow(ValidationError);
  });

  it("isSellable / isPurchased は状態を判定する", () => {
    const sellable = ItemStatus.create(ItemStatusMap.SELLABLE);
    const purchased = ItemStatus.create(ItemStatusMap.PURCHASED);
    expect(ItemStatus.isSellable(sellable)).toBe(true);
    expect(ItemStatus.isPurchased(sellable)).toBe(false);
    expect(ItemStatus.isSellable(purchased)).toBe(false);
    expect(ItemStatus.isPurchased(purchased)).toBe(true);
  });

  it("equals は同一の列挙値なら true", () => {
    const a = ItemStatus.create(ItemStatusMap.SELLABLE);
    const b = ItemStatus.create(ItemStatusMap.SELLABLE);
    expect(ItemStatus.equals(a, b)).toBe(true);
    expect(
      ItemStatus.equals(a, ItemStatus.create(ItemStatusMap.PURCHASED)),
    ).toBe(false);
  });
});
