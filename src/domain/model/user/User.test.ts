import { describe, expect, it } from "vitest";
import { User } from "./User.js";
import { UserEmail } from "./vo/UserEmail.js";
import { UserName } from "./vo/UserName.js";

describe("User", () => {
  it("create: id を null とし名前・メールを保持する", () => {
    const user = User.create("Alice", "alice@example.com");
    expect(user.id).toBeNull();
    expect(UserName.toValue(user.name)).toBe("Alice");
    expect(UserEmail.toValue(user.email)).toBe("alice@example.com");
  });

  it("reconstitute: id を保持し create と同様に VO を組み立てる", () => {
    const user = User.reconstitute(42, "Bob", "bob@example.com");
    expect(user.id).toBe(42);
    expect(UserName.toValue(user.name)).toBe("Bob");
    expect(UserEmail.toValue(user.email)).toBe("bob@example.com");
  });

  it("changeName: 名前だけを差し替え id と email は不変", () => {
    const user = User.reconstitute(1, "Old", "u@example.com");
    const next = User.changeName(user, "New");
    expect(next.id).toBe(1);
    expect(UserName.toValue(next.name)).toBe("New");
    expect(UserEmail.toValue(next.email)).toBe("u@example.com");
  });

  it("changeEmail: メールだけを差し替え id と name は不変", () => {
    const user = User.reconstitute(1, "U", "old@example.com");
    const next = User.changeEmail(user, "new@example.com");
    expect(next.id).toBe(1);
    expect(UserName.toValue(next.name)).toBe("U");
    expect(UserEmail.toValue(next.email)).toBe("new@example.com");
  });
});
