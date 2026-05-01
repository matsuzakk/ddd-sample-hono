import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Item } from "../../domain/model/item/Item.js";
import { ItemPrice } from "../../domain/model/item/ItemPrice.js";
import {
  ItemStatus,
  ItemStatusMap,
} from "../../domain/model/item/ItemStatus.js";
import {
  NotFoundError,
  ValidationError,
} from "../../domain/model/shared/error.js";
import { createPassthroughTxManager } from "../../infrastructure/database/test/testDb.js";
import { purchaseItemUsecase } from "./purchaseItemUsecase.js";

type PurchaseItemDeps = Parameters<typeof purchaseItemUsecase>[0];

describe("purchaseItemUsecase", () => {
  let mockItemRepository: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let mockOrderRepository: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let mockOrderHistoryRepository: { create: ReturnType<typeof vi.fn> };
  let deps: PurchaseItemDeps;

  beforeEach(() => {
    mockItemRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
    };
    mockOrderRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
    };
    mockOrderHistoryRepository = {
      create: vi.fn(),
    };
    deps = {
      txManager: createPassthroughTxManager(),
      createItemRepository: vi.fn(() => mockItemRepository),
      createOrderRepository: vi.fn(() => mockOrderRepository),
      createOrderHistoryRepository: vi.fn(() => mockOrderHistoryRepository),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("販売中の商品を購入し item / order / history を更新する", () => {
    mockItemRepository.findById.mockReturnValue(
      Item.reconstitute(
        1,
        "Book",
        "Description",
        ItemPrice.create(100),
        ItemStatus.create(ItemStatusMap.SELLABLE),
        10,
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );
    mockOrderRepository.create.mockReturnValue(100);

    const dto = purchaseItemUsecase(deps, {
      userId: 20,
      itemId: 1,
    });

    expect(mockItemRepository.findById).toHaveBeenCalledWith(1);
    expect(mockItemRepository.update).toHaveBeenCalledTimes(1);
    expect(Item.isPurchased(mockItemRepository.update.mock.calls[0][0])).toBe(
      true,
    );

    expect(mockOrderRepository.create).toHaveBeenCalledTimes(1);
    const createdOrder = mockOrderRepository.create.mock.calls[0][0];
    expect(createdOrder.id).toBeNull();
    expect(createdOrder.userId).toBe(20);
    expect(createdOrder.itemId).toBe(1);

    expect(mockOrderHistoryRepository.create).toHaveBeenCalledTimes(1);
    const history = mockOrderHistoryRepository.create.mock.calls[0][0];
    expect(history.id).toBeNull();
    expect(history.orderId).toBe(100);
    expect(history.fromStatus).toBeNull();

    expect(dto.id).toBe(100);
    expect(dto.userId).toBe(20);
    expect(dto.itemId).toBe(1);
  });

  it("商品が無いとき NotFoundError とし永続化しない", () => {
    mockItemRepository.findById.mockReturnValue(null);

    expect(() =>
      purchaseItemUsecase(deps, { userId: 1, itemId: 999 }),
    ).toThrow(NotFoundError);
    expect(mockItemRepository.update).not.toHaveBeenCalled();
    expect(mockOrderRepository.create).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
  });

  it("購入済み商品は NotFoundError", () => {
    mockItemRepository.findById.mockReturnValue(
      Item.reconstitute(
        1,
        "Book",
        "Description",
        ItemPrice.create(100),
        ItemStatus.create(ItemStatusMap.PURCHASED),
        10,
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );

    expect(() =>
      purchaseItemUsecase(deps, { userId: 1, itemId: 1 }),
    ).toThrow(NotFoundError);
  });

  it("販売者と購入者が同一のとき ValidationError とし永続化しない", () => {
    mockItemRepository.findById.mockReturnValue(
      Item.reconstitute(
        1,
        "Book",
        "Description",
        ItemPrice.create(100),
        ItemStatus.create(ItemStatusMap.SELLABLE),
        30,
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );

    let thrown: unknown;
    try {
      purchaseItemUsecase(deps, { userId: 30, itemId: 1 });
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(ValidationError);
    expect((thrown as Error).message).toBe("You cannot purchase your own item");
    expect(mockItemRepository.update).not.toHaveBeenCalled();
    expect(mockOrderRepository.create).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
  });
});
