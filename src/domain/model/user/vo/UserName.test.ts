import { describe, expect, it } from "vitest";
import { ValidationError } from "../../shared/error.js";
import { UserName } from "./UserName.js";

describe("UserName", () => {
  it("Zod: 1〜20 文字は create で受理される", () => {
    expect(UserName.toValue(UserName.create("Alice"))).toBe("Alice");
    expect(UserName.toValue(UserName.create("a".repeat(20)))).toHaveLength(20);
  });

  it("Zod: 空文字は ValidationError", () => {
    expect(() => UserName.create("")).toThrow(ValidationError);
  });

  it("Zod: 21 文字以上は ValidationError", () => {
    expect(() => UserName.create("x".repeat(21))).toThrow(ValidationError);
  });

  it("equals は表示名の一致を返す", () => {
    const n = UserName.create("Bob");
    expect(UserName.equals(n, UserName.create("Bob"))).toBe(true);
    expect(UserName.equals(UserName.create("a"), UserName.create("b"))).toBe(
      false,
    );
  });
});
