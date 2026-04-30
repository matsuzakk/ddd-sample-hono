import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "../../domain/model/shared/error.js";
import { registerUser } from "./registerUser.js";

describe("registerUser", () => {
  let signUpEmail: ReturnType<typeof vi.fn>;
  let auth: { api: { signUpEmail: ReturnType<typeof vi.fn> } };

  beforeEach(() => {
    signUpEmail = vi.fn().mockResolvedValue({
      token: null,
      user: {
        id: "user-id-1",
        name: "Alice",
        email: "alice@example.com",
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    auth = { api: { signUpEmail } };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ユーザーを登録し better-auth へ signUp して UserDto を返す", async () => {
    const result = await registerUser(
      { auth: auth as never },
      {
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
      },
    );

    expect(signUpEmail).toHaveBeenCalledWith({
      body: {
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
      },
    });

    expect(result).toEqual({
      id: "user-id-1",
      name: "Alice",
      email: "alice@example.com",
    });
  });

  it("名前が無効なときは signUp を呼ばず ValidationError を投げる", async () => {
    await expect(
      registerUser(
        { auth: auth as never },
        {
          name: "",
          email: "alice@example.com",
          password: "password123",
        },
      ),
    ).rejects.toThrow(ValidationError);
    expect(signUpEmail).not.toHaveBeenCalled();
  });
});
