import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Item } from "../../domain/model/item/Item.js";
import { ItemPrice } from "../../domain/model/item/vo/ItemPrice.js";
import {
  ItemStatus,
  ItemStatusMap,
} from "../../domain/model/item/vo/ItemStatus.js";
import { Order } from "../../domain/model/order/Order.js";
import {
  OrderStatus,
  OrderStatusMap,
} from "../../domain/model/order/vo/OrderStatus.js";
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
    mockOrderRepository.findById.mockReturnValue(
      Order.reconstitute(
        1,
        2,
        3,
        OrderStatus.create(OrderStatusMap.PURCHASED),
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );
    mockItemRepository.findById.mockReturnValue(
      Item.reconstitute(
        3,
        "Book",
        "D",
        ItemPrice.create(0),
        ItemStatus.create(ItemStatusMap.PURCHASED),
        9,
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );

    const dto = cancelOrderUsecase(deps, {
      userId: 2,
      orderId: 1,
    });

    expect(mockOrderRepository.findById).toHaveBeenCalledWith(1);
    expect(mockOrderRepository.update).toHaveBeenCalledTimes(1);
    expect(
      OrderStatus.isCanceled(
        mockOrderRepository.update.mock.calls[0][0].status,
      ),
    ).toBe(true);

    expect(mockItemRepository.findById).toHaveBeenCalledWith(3);
    expect(mockItemRepository.update).toHaveBeenCalledTimes(1);
    expect(Item.isSellable(mockItemRepository.update.mock.calls[0][0])).toBe(
      true,
    );

    expect(mockOrderHistoryRepository.create).toHaveBeenCalledTimes(1);
    expect(dto.status).toBe(OrderStatusMap.CANCELED);
  });

  it("購入者以外がキャンセルしようとしたとき NotFoundError とし副作用がない", () => {
    mockOrderRepository.findById.mockReturnValue(
      Order.reconstitute(
        1,
        2,
        3,
        OrderStatus.create(OrderStatusMap.PURCHASED),
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );

    expect(() =>
      cancelOrderUsecase(deps, { userId: 99, orderId: 1 }),
    ).toThrow(NotFoundError);
    expect(mockOrderRepository.update).not.toHaveBeenCalled();
    expect(mockItemRepository.findById).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
    expect(mockItemRepository.update).not.toHaveBeenCalled();
  });

  it("注文が無いとき NotFoundError とし副作用がない", () => {
    mockOrderRepository.findById.mockReturnValue(null);

    expect(() =>
      cancelOrderUsecase(deps, { userId: 2, orderId: 999 }),
    ).toThrow(NotFoundError);
    expect(mockOrderRepository.update).not.toHaveBeenCalled();
    expect(mockItemRepository.findById).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
  });

  it("商品が無いとき NotFoundError（注文は購入済み）", () => {
    mockOrderRepository.findById.mockReturnValue(
      Order.reconstitute(
        1,
        2,
        3,
        OrderStatus.create(OrderStatusMap.PURCHASED),
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );
    mockItemRepository.findById.mockReturnValue(null);

    expect(() =>
      cancelOrderUsecase(deps, { userId: 2, orderId: 1 }),
    ).toThrow(NotFoundError);
    expect(mockOrderRepository.update).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
    expect(mockItemRepository.update).not.toHaveBeenCalled();
  });

  it("キャンセル不可な状態はドメインで ValidationError", () => {
    mockOrderRepository.findById.mockReturnValue(
      Order.reconstitute(
        1,
        2,
        3,
        OrderStatus.create(OrderStatusMap.SHIPPED),
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );
    mockItemRepository.findById.mockReturnValue(
      Item.reconstitute(
        3,
        "Book",
        "D",
        ItemPrice.create(0),
        ItemStatus.create(ItemStatusMap.PURCHASED),
        9,
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );

    expect(() =>
      cancelOrderUsecase(deps, { userId: 2, orderId: 1 }),
    ).toThrow(ValidationError);
  });
});
