import { describe, expect, it } from "vitest";
import { ValidationError } from "../../shared/error.js";
import { UserEmail } from "./UserEmail.js";

describe("UserEmail", () => {
  it("Zod: 許容形式のメールは create で受理される", () => {
    const e = UserEmail.create("user.name+tag@sub.example.com");
    expect(UserEmail.toValue(e)).toBe("user.name+tag@sub.example.com");
  });

  it("Zod: 形式不正は ValidationError", () => {
    expect(() => UserEmail.create("not-an-email")).toThrow(ValidationError);
    expect(() => UserEmail.create("")).toThrow(ValidationError);
  });

  it("equals は同じアドレスなら true", () => {
    const a = UserEmail.create("a@b.co");
    expect(UserEmail.equals(a, UserEmail.create("a@b.co"))).toBe(true);
    expect(
      UserEmail.equals(
        UserEmail.create("x@yz.com"),
        UserEmail.create("a@b.co"),
      ),
    ).toBe(false);
  });
});
