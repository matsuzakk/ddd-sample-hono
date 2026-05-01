import { describe, expect, it } from "vitest";
import { ValidationError } from "../shared/error.js";
import { UserEmail } from "./UserEmail.js";

describe("UserEmail", () => {
  it("create は有効なアドレスを受け入れる", () => {
    const email = UserEmail.create("user@example.com");
    expect(UserEmail.toValue(email)).toBe("user@example.com");
  });

  it("create は無効なアドレスで ValidationError を投げる", () => {
    expect(() => UserEmail.create("not-an-email")).toThrow(ValidationError);
    expect(() => UserEmail.create("")).toThrow(ValidationError);
  });

  it("isValid は形式に応じて true/false を返す", () => {
    expect(UserEmail.isValid("a@b.co")).toBe(true);
    expect(UserEmail.isValid("user.name+tag@sub.example.com")).toBe(true);
    expect(UserEmail.isValid("invalid")).toBe(false);
    expect(UserEmail.isValid("@nodomain.com")).toBe(false);
  });

  it("equals は同じ文字列の Email を true にする（文字列としての同一性）", () => {
    const a = UserEmail.create("same@example.com");
    const b = UserEmail.create("same@example.com");
    expect(UserEmail.equals(a, a)).toBe(true);
    expect(UserEmail.equals(a, b)).toBe(true);
    const other = UserEmail.create("other@example.com");
    expect(UserEmail.equals(a, other)).toBe(false);
  });
});
