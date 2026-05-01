import { describe, expect, it } from "vitest";
import { ValidationError } from "../../shared/error.js";
import { UserName } from "./UserName.js";

describe("UserName", () => {
  it("create は 1〜20 文字を受け入れる", () => {
    const name = UserName.create("Alice");
    expect(UserName.toValue(name)).toBe("Alice");
  });

  it("create は空文字で ValidationError を投げる", () => {
    expect(() => UserName.create("")).toThrow(ValidationError);
  });

  it("create は 21 文字以上で ValidationError を投げる", () => {
    expect(() => UserName.create("a".repeat(21))).toThrow(ValidationError);
  });

  it("reconstitute は空文字を受け入れる", () => {
    const name = UserName.reconstitute("");
    expect(UserName.toValue(name)).toBe("");
  });

  it("reconstitute は 20 文字を超えると ValidationError を投げる", () => {
    expect(() => UserName.reconstitute("a".repeat(21))).toThrow(
      ValidationError,
    );
  });

  it("equals は文字列としての同一性を返す", () => {
    const a = UserName.create("Bob");
    const b = UserName.create("Bob");
    expect(UserName.equals(a, a)).toBe(true);
    expect(UserName.equals(a, b)).toBe(true);
    expect(UserName.equals(a, UserName.create("Other"))).toBe(false);
  });
});
