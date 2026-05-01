import { describe, expect, it } from "vitest";
import { ValidationError } from "../../shared/error.js";
import { ItemDescription } from "./ItemDescription.js";

describe("ItemDescription", () => {
  it("Zod: 1〜1000 文字は create で受け入れる", () => {
    const d = ItemDescription.create("d");
    expect(ItemDescription.toValue(d)).toBe("d");
    const long = ItemDescription.create("z".repeat(1000));
    expect(ItemDescription.toValue(long)).toHaveLength(1000);
  });

  it("Zod: 空文字は ValidationError", () => {
    expect(() => ItemDescription.create("")).toThrow(ValidationError);
  });

  it("Zod: 1001 文字以上は ValidationError", () => {
    expect(() => ItemDescription.create("x".repeat(1001))).toThrow(
      ValidationError,
    );
  });

  it("equals は文字列値が同じなら true / 異なれば false", () => {
    const a = ItemDescription.create("same");
    const b = ItemDescription.create("same");
    expect(ItemDescription.equals(a, b)).toBe(true);
    expect(
      ItemDescription.equals(
        ItemDescription.create("a"),
        ItemDescription.create("b"),
      ),
    ).toBe(false);
  });
});
