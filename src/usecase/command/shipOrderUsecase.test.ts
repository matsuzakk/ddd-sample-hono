import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Item } from "../../domain/model/item/Item.js";
import { ItemPrice } from "../../domain/model/item/ItemPrice.js";
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
import { shipOrderUsecase } from "./shipOrderUsecase.js";

type ShipOrderDeps = Parameters<typeof shipOrderUsecase>[0];

describe("shipOrder", () => {
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
  let deps: ShipOrderDeps;

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

  it("購入済み注文を発送済みにし履歴を残す", () => {
    // 準備: 購入済み注文と履歴用 UUID
    mockOrderRepository.findById.mockReturnValue(
      Order.reconstitute(
        "order-1",
        "buyer-1",
        "item-1",
        OrderStatus.create(OrderStatusMap.PURCHASED),
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );
    mockItemRepository.findById.mockReturnValue(
      Item.create(
        "item-1",
        "Book",
        "Description",
        ItemPrice.create(100),
        "seller-1",
      ),
    );
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "40000000-0000-4000-8000-000000000001",
    );

    // 実行
    const dto = shipOrderUsecase(deps, {
      userId: "seller-1",
      orderId: "order-1",
    });

    // 検証: 注文の更新
    expect(mockOrderRepository.findById).toHaveBeenCalledWith("order-1");
    expect(mockItemRepository.findById).toHaveBeenCalledWith("item-1");
    expect(mockOrderRepository.update).toHaveBeenCalledTimes(1);
    expect(
      OrderStatus.isShipped(mockOrderRepository.update.mock.calls[0][0].status),
    ).toBe(true);

    // 検証: 履歴
    expect(mockOrderHistoryRepository.create).toHaveBeenCalledTimes(1);
    const history = mockOrderHistoryRepository.create.mock.calls[0][0];
    expect(history.id).toBe("40000000-0000-4000-8000-000000000001");
    expect(history.orderId).toBe("order-1");

    // 検証: DTO
    expect(dto.status).toBe(OrderStatusMap.SHIPPED);
    expect(dto.id).toBe("order-1");
  });

  it("注文が無いとき NotFoundError とし更新しない", () => {
    // 準備: 未ヒット
    mockOrderRepository.findById.mockReturnValue(null);

    // 実行 & 検証
    expect(() =>
      shipOrderUsecase(deps, { userId: "seller-1", orderId: "missing" }),
    ).toThrow(NotFoundError);
    expect(mockOrderRepository.update).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
  });

  it("販売者以外が発送しようとしたとき ValidationError とし更新しない", () => {
    mockOrderRepository.findById.mockReturnValue(
      Order.reconstitute(
        "order-1",
        "buyer-1",
        "item-1",
        OrderStatus.create(OrderStatusMap.PURCHASED),
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );
    mockItemRepository.findById.mockReturnValue(
      Item.create(
        "item-1",
        "Book",
        "Description",
        ItemPrice.create(100),
        "seller-1",
      ),
    );

    expect(() =>
      shipOrderUsecase(deps, { userId: "buyer-1", orderId: "order-1" }),
    ).toThrow(ValidationError);
    expect(mockOrderRepository.update).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
  });

  it("購入済み以外はドメインで ValidationError", () => {
    // 準備: すでに発送済み
    mockOrderRepository.findById.mockReturnValue(
      Order.reconstitute(
        "order-1",
        "buyer-1",
        "item-1",
        OrderStatus.create(OrderStatusMap.SHIPPED),
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );
    mockItemRepository.findById.mockReturnValue(
      Item.create(
        "item-1",
        "Book",
        "Description",
        ItemPrice.create(100),
        "seller-1",
      ),
    );

    // 実行 & 検証
    expect(() =>
      shipOrderUsecase(deps, { userId: "seller-1", orderId: "order-1" }),
    ).toThrow(ValidationError);
  });
});
