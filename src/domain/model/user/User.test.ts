import { describe, expect, it } from "vitest";
import { ValidationError } from "../shared/error.js";
import { User } from "./User.js";
import { UserEmail } from "./vo/UserEmail.js";
import { UserName } from "./vo/UserName.js";

describe("User", () => {
  it("create は有効な名前とメールでユーザーを返す", () => {
    const user = User.create("Alice", "alice@example.com");
    expect(user.id).toBeNull();
    expect(UserName.toValue(user.name)).toBe("Alice");
    expect(UserEmail.toValue(user.email)).toBe("alice@example.com");
  });

  it("create は空文字の名前で ValidationError を投げる", () => {
    expect(() => User.create("", "a@b.co")).toThrow(ValidationError);
  });

  it("create は 21 文字以上の名前で ValidationError を投げる", () => {
    const tooLong = "a".repeat(21);
    expect(() => User.create(tooLong, "a@b.co")).toThrow(ValidationError);
  });

  it("create は無効なメールで ValidationError を投げる", () => {
    expect(() => User.create("Bob", "bad")).toThrow(ValidationError);
  });

  it("reconstitute はメールを検証し名前は最大 20 文字まで許容（空文字可）", () => {
    const user = User.reconstitute(1, "", "legacy@example.com");
    expect(UserName.toValue(user.name)).toBe("");
    expect(UserEmail.toValue(user.email)).toBe("legacy@example.com");
  });

  it("reconstitute は無効なメールで ValidationError を投げる", () => {
    expect(() => User.reconstitute(1, "Name", "x")).toThrow(ValidationError);
  });

  it("changeName は有効な名前に更新する", () => {
    const user = User.create("Old", "u@example.com");
    const updated = User.changeName(user, "New");
    expect(updated).not.toBe(user);
    expect(UserName.toValue(updated.name)).toBe("New");
    expect(UserEmail.toValue(updated.email)).toBe(
      UserEmail.toValue(user.email),
    );
  });

  it("changeName は無効な名前で ValidationError を投げる", () => {
    const user = User.create("Ok", "u@example.com");
    expect(() => User.changeName(user, "")).toThrow(ValidationError);
  });

  it("changeEmail は有効なメールに更新する", () => {
    const user = User.create("Name", "old@example.com");
    const updated = User.changeEmail(user, "new@example.com");
    expect(updated).not.toBe(user);
    expect(UserEmail.toValue(updated.email)).toBe("new@example.com");
    expect(UserName.equals(updated.name, user.name)).toBe(true);
  });

  it("changeEmail は無効なメールで ValidationError を投げる", () => {
    const user = User.create("Name", "ok@example.com");
    expect(() => User.changeEmail(user, "bad")).toThrow(ValidationError);
  });
});
