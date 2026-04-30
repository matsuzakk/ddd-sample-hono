import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ItemStatusMap } from "../../domain/model/item/ItemStatus.js";
import { ValidationError } from "../../domain/model/shared/error.js";
import type { AppDatabase } from "../../infrastructure/database/db.js";
import { sellItem } from "./sellItem.js";

describe("sellItem", () => {
  let mockCreate: ReturnType<typeof vi.fn>;
  let createItemRepository: ReturnType<typeof vi.fn>;
  let appDb: AppDatabase;

  beforeEach(() => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "30000000-0000-4000-8000-000000000001",
    );
    mockCreate = vi.fn();
    createItemRepository = vi.fn().mockImplementation(() => ({
      create: mockCreate,
      findById: vi.fn(),
      update: vi.fn(),
    }));
    appDb = {} as AppDatabase;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("商品を作成しリポジトリへ保存して ItemDto を返す", () => {
    // 実行
    const result = sellItem(
      { db: appDb, createItemRepository },
      {
        sellerId: "seller-1",
        name: "Book",
        description: "A good book",
        price: 500,
      },
    );

    // 検証: ファクトリと永続化
    expect(createItemRepository).toHaveBeenCalledWith(appDb);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate.mock.calls[0][0].id).toBe(
      "30000000-0000-4000-8000-000000000001",
    );

    // 検証: レスポンス
    expect(result).toMatchObject({
      id: "30000000-0000-4000-8000-000000000001",
      name: "Book",
      description: "A good book",
      price: 500,
      status: ItemStatusMap.SELLABLE,
      sellerId: "seller-1",
    });
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("価格が無効なときは永続化せず ValidationError を投げる", () => {
    // 実行 & 検証
    expect(() =>
      sellItem(
        { db: appDb, createItemRepository },
        {
          sellerId: "s",
          name: "N",
          description: "D",
          price: -1,
        },
      ),
    ).toThrow(ValidationError);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
