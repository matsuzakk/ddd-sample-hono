import { describe, expect, it } from "vitest";
import { ValidationError } from "../../shared/error.js";
import { ItemName } from "./ItemName.js";

describe("ItemName", () => {
  it("Zod: 1〜20 文字は create で受け入れ toValue が素の文字列になる", () => {
    const a = ItemName.create("a");
    expect(ItemName.toValue(a)).toBe("a");
    const full = ItemName.create("x".repeat(20));
    expect(ItemName.toValue(full)).toHaveLength(20);
  });

  it("Zod: 空文字は ValidationError", () => {
    expect(() => ItemName.create("")).toThrow(ValidationError);
  });

  it("Zod: 21 文字以上は ValidationError", () => {
    expect(() => ItemName.create("n".repeat(21))).toThrow(ValidationError);
  });

  it("equals は同一文字列ブランド同一性が true / 異なるものは false", () => {
    const x = ItemName.create("x");
    expect(ItemName.equals(x, x)).toBe(true);
    expect(ItemName.equals(ItemName.create("z"), ItemName.create("z"))).toBe(
      true,
    );
    expect(ItemName.equals(ItemName.create("a"), ItemName.create("b"))).toBe(
      false,
    );
  });
});
