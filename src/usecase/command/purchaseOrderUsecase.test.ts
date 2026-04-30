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
import { purchaseOrderUsecase } from "./purchaseOrderUsecase.js";

type PurchaseOrderDeps = Parameters<typeof purchaseOrderUsecase>[0];

describe("purchaseOrder", () => {
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
  let deps: PurchaseOrderDeps;

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
    // 準備: 販売可能な商品と UUID
    mockItemRepository.findById.mockReturnValue(
      Item.create(
        "item-1",
        "Book",
        "Description",
        ItemPrice.create(100),
        "seller",
      ),
    );
    vi.spyOn(crypto, "randomUUID")
      .mockReturnValueOnce("10000000-0000-4000-8000-000000000001")
      .mockReturnValueOnce("20000000-0000-4000-8000-000000000001");

    // 実行
    const dto = purchaseOrderUsecase(deps, {
      userId: "buyer",
      itemId: "item-1",
    });

    // 検証: 取得と更新
    expect(mockItemRepository.findById).toHaveBeenCalledWith("item-1");
    expect(mockItemRepository.update).toHaveBeenCalledTimes(1);
    expect(Item.isPurchased(mockItemRepository.update.mock.calls[0][0])).toBe(
      true,
    );

    // 検証: 注文と履歴
    expect(mockOrderRepository.create).toHaveBeenCalledTimes(1);
    const createdOrder = mockOrderRepository.create.mock.calls[0][0];
    expect(createdOrder.id).toBe("10000000-0000-4000-8000-000000000001");
    expect(createdOrder.userId).toBe("buyer");
    expect(createdOrder.itemId).toBe("item-1");

    expect(mockOrderHistoryRepository.create).toHaveBeenCalledTimes(1);
    const history = mockOrderHistoryRepository.create.mock.calls[0][0];
    expect(history.id).toBe("20000000-0000-4000-8000-000000000001");
    expect(history.orderId).toBe("10000000-0000-4000-8000-000000000001");
    expect(history.fromStatus).toBeNull();

    // 検証: DTO
    expect(dto.id).toBe("10000000-0000-4000-8000-000000000001");
    expect(dto.userId).toBe("buyer");
    expect(dto.itemId).toBe("item-1");
  });

  it("商品が無いとき NotFoundError とし永続化しない", () => {
    // 準備: 未ヒット
    mockItemRepository.findById.mockReturnValue(null);

    // 実行 & 検証
    expect(() =>
      purchaseOrderUsecase(deps, { userId: "buyer", itemId: "missing" }),
    ).toThrow(NotFoundError);
    expect(mockItemRepository.update).not.toHaveBeenCalled();
    expect(mockOrderRepository.create).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
  });

  it("購入済み商品は NotFoundError", () => {
    // 準備: 既に購入済み
    mockItemRepository.findById.mockReturnValue(
      Item.reconstitute(
        "item-1",
        "Book",
        "Description",
        ItemPrice.create(100),
        ItemStatus.create(ItemStatusMap.PURCHASED),
        "seller",
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );

    // 実行 & 検証
    expect(() =>
      purchaseOrderUsecase(deps, { userId: "buyer", itemId: "item-1" }),
    ).toThrow(NotFoundError);
  });

  it("出品者自身の購入はドメインで ValidationError", () => {
    // 準備: 自分の商品を買おうとする
    mockItemRepository.findById.mockReturnValue(
      Item.create(
        "item-1",
        "Book",
        "Description",
        ItemPrice.create(100),
        "seller",
      ),
    );

    // 実行 & 検証
    expect(() =>
      purchaseOrderUsecase(deps, { userId: "seller", itemId: "item-1" }),
    ).toThrow(ValidationError);
  });
});
