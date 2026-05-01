import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ItemStatusMap } from "../../domain/model/item/vo/ItemStatus.js";
import {
  NotFoundError,
  ValidationError,
} from "../../domain/model/shared/error.js";
import { User } from "../../domain/model/user/User.js";
import type { AppDatabase } from "../../infrastructure/database/db.js";
import { sellItemUsecase } from "./sellItemUsecase.js";

describe("sellItem", () => {
  let mockCreate: ReturnType<typeof vi.fn>;
  let createItemRepository: ReturnType<typeof vi.fn>;
  let createUserRepository: ReturnType<typeof vi.fn>;
  let mockUserRepository: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
  };
  let appDb: AppDatabase;

  beforeEach(() => {
    mockCreate = vi.fn().mockReturnValue(7);
    createItemRepository = vi.fn().mockImplementation(() => ({
      create: mockCreate,
      findById: vi.fn(),
      update: vi.fn(),
    }));
    mockUserRepository = {
      create: vi.fn(),
      findById: vi
        .fn()
        .mockReturnValue(User.reconstitute(1, "Seller", "seller@example.com")),
    };
    createUserRepository = vi.fn(() => mockUserRepository);
    appDb = {} as AppDatabase;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("商品を作成しリポジトリへ保存して ItemDto を返す", () => {
    const result = sellItemUsecase(
      { db: appDb, createItemRepository, createUserRepository },
      {
        sellerId: 1,
        name: "Book",
        description: "A good book",
        price: 500,
      },
    );

    expect(createUserRepository).toHaveBeenCalledWith(appDb);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    expect(createItemRepository).toHaveBeenCalledWith(appDb);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate.mock.calls[0][0].id).toBeNull();

    expect(result).toMatchObject({
      id: 7,
      name: "Book",
      description: "A good book",
      price: 500,
      status: ItemStatusMap.SELLABLE,
      sellerId: 1,
    });
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("出品者が users に存在しないとき NotFoundError とし item は保存しない", () => {
    mockUserRepository.findById.mockReturnValue(null);

    expect(() =>
      sellItemUsecase(
        { db: appDb, createItemRepository, createUserRepository },
        {
          sellerId: 999,
          name: "Book",
          description: "A good book",
          price: 500,
        },
      ),
    ).toThrow(NotFoundError);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("価格が無効なときは永続化せず ValidationError を投げる", () => {
    expect(() =>
      sellItemUsecase(
        { db: appDb, createItemRepository, createUserRepository },
        {
          sellerId: 1,
          name: "N",
          description: "D",
          price: -1,
        },
      ),
    ).toThrow(ValidationError);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
