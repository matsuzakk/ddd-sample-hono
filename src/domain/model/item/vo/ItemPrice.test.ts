import { describe, expect, it } from "vitest";
import { ValidationError } from "../../shared/error.js";
import { ItemPrice } from "./ItemPrice.js";

describe("ItemPrice", () => {
  it("Zod: 0〜999999 の整数は create で受け入れる", () => {
    expect(ItemPrice.toValue(ItemPrice.create(0))).toBe(0);
    expect(ItemPrice.toValue(ItemPrice.create(999_999))).toBe(999_999);
  });

  it("Zod: 負の数は ValidationError", () => {
    expect(() => ItemPrice.create(-1)).toThrow(ValidationError);
  });

  it("Zod: 小数は ValidationError", () => {
    expect(() => ItemPrice.create(10.5)).toThrow(ValidationError);
  });

  it("Zod: 1000000 以上は ValidationError", () => {
    expect(() => ItemPrice.create(1_000_000)).toThrow(ValidationError);
  });

  it("equals は数値として同値なら true", () => {
    const p = ItemPrice.create(42);
    expect(ItemPrice.equals(p, ItemPrice.create(42))).toBe(true);
    expect(ItemPrice.equals(ItemPrice.create(1), ItemPrice.create(2))).toBe(
      false,
    );
  });
});
