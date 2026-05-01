import { describe, expect, it } from "vitest";
import { ValidationError } from "../shared/error.js";
import { UserEmail } from "./UserEmail.js";

describe("UserEmail", () => {
  it("create は有効なアドレスを受け入れる", () => {
    const email = UserEmail.create("user@example.com");
    expect(UserEmail.toValue(email)).toBe("user@example.com");
  });

  it("create は無効なアドレスで ValidationError を投げる（メッセージは Zod の issue 由来）", () => {
    for (const invalid of ["not-an-email", ""]) {
      try {
        UserEmail.create(invalid);
        expect.fail(`expected throw for ${JSON.stringify(invalid)}`);
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationError);
        expect((e as ValidationError).message).toBe("Email must be valid");
      }
    }
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
