import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "../../domain/model/shared/error.js";
import type { AppDatabase } from "../../infrastructure/database/db.js";
import { registerUser } from "./registerUser.js";

describe("registerUser", () => {
  let mockCreate: ReturnType<typeof vi.fn>;
  let createUserRepository: ReturnType<typeof vi.fn>;
  let appDb: AppDatabase;

  beforeEach(() => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("user-id-1");
    mockCreate = vi.fn();
    createUserRepository = vi.fn().mockImplementation(() => ({
      create: mockCreate,
    }));
    appDb = {} as AppDatabase;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ユーザーを登録しリポジトリへ保存して UserDto を返す", () => {
    // 実行
    const result = registerUser(
      { db: appDb, createUserRepository },
      { name: "Alice", email: "alice@example.com" },
    );

    // 検証: ファクトリに渡した db と永続化の呼び出し
    expect(createUserRepository).toHaveBeenCalledWith(appDb);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate.mock.calls[0][0]).toMatchObject({
      id: "user-id-1",
      name: "Alice",
    });

    // 検証: レスポンス
    expect(result).toEqual({
      id: "user-id-1",
      name: "Alice",
      email: "alice@example.com",
    });
  });

  it("名前が無効なときは永続化せず ValidationError を投げる", () => {
    // 実行 & 検証
    expect(() =>
      registerUser(
        { db: appDb, createUserRepository },
        { name: "", email: "alice@example.com" },
      ),
    ).toThrow(ValidationError);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
