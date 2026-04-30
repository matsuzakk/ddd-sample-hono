import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Item } from "../../domain/model/item/Item.js";
import { ItemPrice } from "../../domain/model/item/ItemPrice.js";
import {
  ItemStatus,
  ItemStatusMap,
} from "../../domain/model/item/ItemStatus.js";
import { Order } from "../../domain/model/order/Order.js";
import {
  OrderStatus,
  OrderStatusMap,
} from "../../domain/model/order/OrderStatus.js";
import {
  NotFoundError,
  ValidationError,
} from "../../domain/model/shared/error.js";
import { createPassthroughTxManager } from "../../infrastructure/database/test/testDb.js";
import { cancelOrderUsecase } from "./cancelOrderUsecase.js";

describe("cancelOrder", () => {
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
  let deps: Parameters<typeof cancelOrderUsecase>[0];

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

  it("購入済み注文をキャンセルし商品を再販売可能にする", () => {
    // 準備: 購入済みの注文・商品と履歴用 UUID
    mockOrderRepository.findById.mockReturnValue(
      Order.reconstitute(
        "order-1",
        "buyer",
        "item-1",
        OrderStatus.create(OrderStatusMap.PURCHASED),
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );
    mockItemRepository.findById.mockReturnValue(
      Item.reconstitute(
        "item-1",
        "Book",
        "D",
        ItemPrice.create(0),
        ItemStatus.create(ItemStatusMap.PURCHASED),
        "seller",
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "60000000-0000-4000-8000-000000000001",
    );

    // 実行
    const dto = cancelOrderUsecase(deps, {
      userId: "buyer",
      orderId: "order-1",
    });

    // 検証: 注文キャンセル
    expect(mockOrderRepository.findById).toHaveBeenCalledWith("order-1");
    expect(mockOrderRepository.update).toHaveBeenCalledTimes(1);
    expect(
      OrderStatus.isCanceled(
        mockOrderRepository.update.mock.calls[0][0].status,
      ),
    ).toBe(true);

    // 検証: 商品を出品可能に戻す
    expect(mockItemRepository.findById).toHaveBeenCalledWith("item-1");
    expect(mockItemRepository.update).toHaveBeenCalledTimes(1);
    expect(Item.isSellable(mockItemRepository.update.mock.calls[0][0])).toBe(
      true,
    );

    // 検証: 履歴と DTO
    expect(mockOrderHistoryRepository.create).toHaveBeenCalledTimes(1);
    expect(dto.status).toBe(OrderStatusMap.CANCELED);
  });

  it("注文が無いとき NotFoundError とし副作用がない", () => {
    // 準備: 注文なし
    mockOrderRepository.findById.mockReturnValue(null);

    // 実行 & 検証
    expect(() =>
      cancelOrderUsecase(deps, { userId: "buyer", orderId: "missing" }),
    ).toThrow(NotFoundError);
    expect(mockOrderRepository.update).not.toHaveBeenCalled();
    expect(mockItemRepository.findById).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
  });

  it("商品が無いとき NotFoundError（注文は購入済み）", () => {
    // 準備: 注文はあるが商品行がない
    mockOrderRepository.findById.mockReturnValue(
      Order.reconstitute(
        "order-1",
        "buyer",
        "item-1",
        OrderStatus.create(OrderStatusMap.PURCHASED),
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );
    mockItemRepository.findById.mockReturnValue(null);

    // 実行 & 検証
    expect(() =>
      cancelOrderUsecase(deps, { userId: "buyer", orderId: "order-1" }),
    ).toThrow(NotFoundError);
    expect(mockOrderRepository.update).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
    expect(mockItemRepository.update).not.toHaveBeenCalled();
  });

  it("キャンセル不可な状態はドメインで ValidationError", () => {
    // 準備: すでに発送済みの注文と購入済み商品
    mockOrderRepository.findById.mockReturnValue(
      Order.reconstitute(
        "order-1",
        "buyer",
        "item-1",
        OrderStatus.create(OrderStatusMap.SHIPPED),
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );
    mockItemRepository.findById.mockReturnValue(
      Item.reconstitute(
        "item-1",
        "Book",
        "D",
        ItemPrice.create(0),
        ItemStatus.create(ItemStatusMap.PURCHASED),
        "seller",
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );

    // 実行 & 検証
    expect(() =>
      cancelOrderUsecase(deps, { userId: "buyer", orderId: "order-1" }),
    ).toThrow(ValidationError);
  });
});
