import { describe, expect, it } from "vitest";
import { ValidationError } from "../../shared/error.js";
import { ItemStatus, ItemStatusMap } from "./ItemStatus.js";

describe("ItemStatus", () => {
  it("Zod: SELLABLE / PURCHASED のみ create で受理される", () => {
    expect(ItemStatus.toValue(ItemStatus.create(ItemStatusMap.SELLABLE))).toBe(
      ItemStatusMap.SELLABLE,
    );
    expect(ItemStatus.toValue(ItemStatus.create(ItemStatusMap.PURCHASED))).toBe(
      ItemStatusMap.PURCHASED,
    );
  });

  it("Zod: 未定義の数値は ValidationError（Invalid item status）", () => {
    expect(() => ItemStatus.create(9)).toThrow(ValidationError);
    expect(() => ItemStatus.create(1.5)).toThrow(ValidationError);
  });

  it("isPurchased / isSellable が数値に一致する", () => {
    const s = ItemStatus.create(ItemStatusMap.SELLABLE);
    const p = ItemStatus.create(ItemStatusMap.PURCHASED);
    expect(ItemStatus.isSellable(s)).toBe(true);
    expect(ItemStatus.isPurchased(s)).toBe(false);
    expect(ItemStatus.isPurchased(p)).toBe(true);
    expect(ItemStatus.isSellable(p)).toBe(false);
  });
});
