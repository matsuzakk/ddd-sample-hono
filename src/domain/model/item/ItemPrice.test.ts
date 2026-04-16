import { describe, expect, it } from "vitest";
import { ValidationError } from "../shared/error.js";
import { ItemPrice } from "./ItemPrice.js";

describe("ItemPrice", () => {
  it("create は 0 以上 999999 以下を受け入れる", () => {
    const min = ItemPrice.create(0);
    const max = ItemPrice.create(999999);
    expect(ItemPrice.toValue(min)).toBe(0);
    expect(ItemPrice.toValue(max)).toBe(999999);
  });

  it("create は範囲外で ValidationError を投げる", () => {
    expect(() => ItemPrice.create(-1)).toThrow(ValidationError);
    expect(() => ItemPrice.create(1_000_000)).toThrow(ValidationError);
  });

  it("reconstitute は有効な値を復元する", () => {
    const price = ItemPrice.reconstitute(500);
    expect(ItemPrice.toValue(price)).toBe(500);
  });

  it("reconstitute は無効な値で ValidationError を投げる", () => {
    expect(() => ItemPrice.reconstitute(-10)).toThrow(ValidationError);
  });

  it("isValid は境界を反映する", () => {
    expect(ItemPrice.isValid(0)).toBe(true);
    expect(ItemPrice.isValid(999999)).toBe(true);
    expect(ItemPrice.isValid(-0.001)).toBe(false);
    expect(ItemPrice.isValid(1_000_000)).toBe(false);
  });

  it("equals は数値としての同一性を返す", () => {
    const a = ItemPrice.create(100);
    const b = ItemPrice.create(100);
    expect(ItemPrice.equals(a, b)).toBe(true);
    expect(ItemPrice.equals(a, ItemPrice.create(101))).toBe(false);
  });
});
