import { describe, expect, it } from "vitest";
import { ValidationError } from "../shared/error.js";
import { Email, User } from "./User.js";

describe("Email", () => {
  it("create は有効なアドレスを受け入れる", () => {
    const email = Email.create("user@example.com");
    expect(Email.toValue(email)).toBe("user@example.com");
  });

  it("create は無効なアドレスで ValidationError を投げる", () => {
    expect(() => Email.create("not-an-email")).toThrow(ValidationError);
    expect(() => Email.create("")).toThrow(ValidationError);
  });

  it("isValid は形式に応じて true/false を返す", () => {
    expect(Email.isValid("a@b.co")).toBe(true);
    expect(Email.isValid("user.name+tag@sub.example.com")).toBe(true);
    expect(Email.isValid("invalid")).toBe(false);
    expect(Email.isValid("@nodomain.com")).toBe(false);
  });

  it("equals は同じ文字列の Email を true にする（文字列としての同一性）", () => {
    const a = Email.create("same@example.com");
    const b = Email.create("same@example.com");
    expect(Email.equals(a, a)).toBe(true);
    expect(Email.equals(a, b)).toBe(true);
    const other = Email.create("other@example.com");
    expect(Email.equals(a, other)).toBe(false);
  });
});

describe("User", () => {
  it("create は有効な名前とメールでユーザーを返す", () => {
    const user = User.create("id-1", "Alice", "alice@example.com");
    expect(user.id).toBe("id-1");
    expect(user.name).toBe("Alice");
    expect(Email.toValue(user.email)).toBe("alice@example.com");
  });

  it("create は空文字の名前で ValidationError を投げる", () => {
    expect(() => User.create("id-1", "", "a@b.co")).toThrow(ValidationError);
  });

  it("create は 21 文字以上の名前で ValidationError を投げる", () => {
    const tooLong = "a".repeat(21);
    expect(() => User.create("id-1", tooLong, "a@b.co")).toThrow(
      ValidationError,
    );
  });

  it("create は無効なメールで ValidationError を投げる", () => {
    expect(() => User.create("id-1", "Bob", "bad")).toThrow(ValidationError);
  });

  it("reconstitute はメールのみ検証し名前長は検証しない", () => {
    const user = User.reconstitute("id-1", "", "legacy@example.com");
    expect(user.name).toBe("");
    expect(Email.toValue(user.email)).toBe("legacy@example.com");
  });

  it("reconstitute は無効なメールで ValidationError を投げる", () => {
    expect(() => User.reconstitute("id-1", "Name", "x")).toThrow(
      ValidationError,
    );
  });

  it("changeName は有効な名前に更新する", () => {
    const user = User.create("id-1", "Old", "u@example.com");
    const updated = User.changeName(user, "New");
    expect(updated).not.toBe(user);
    expect(updated.name).toBe("New");
    expect(Email.toValue(updated.email)).toBe(Email.toValue(user.email));
  });

  it("changeName は無効な名前で ValidationError を投げる", () => {
    const user = User.create("id-1", "Ok", "u@example.com");
    expect(() => User.changeName(user, "")).toThrow(ValidationError);
  });

  it("changeEmail は有効なメールに更新する", () => {
    const user = User.create("id-1", "Name", "old@example.com");
    const updated = User.changeEmail(user, "new@example.com");
    expect(updated).not.toBe(user);
    expect(Email.toValue(updated.email)).toBe("new@example.com");
    expect(updated.name).toBe(user.name);
  });

  it("changeEmail は無効なメールで ValidationError を投げる", () => {
    const user = User.create("id-1", "Name", "ok@example.com");
    expect(() => User.changeEmail(user, "bad")).toThrow(ValidationError);
  });
});
