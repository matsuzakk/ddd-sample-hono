import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Item } from "../../domain/model/item/Item.js";
import { ItemPrice } from "../../domain/model/item/ItemPrice.js";
import { ItemStatus, ItemStatusMap } from "../../domain/model/item/ItemStatus.js";
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

const itemRow = () =>
  Item.reconstitute(
    5,
    "Book",
    "Description",
    ItemPrice.create(100),
    ItemStatus.create(ItemStatusMap.SELLABLE),
    10,
    new Date("2024-01-01T00:00:00.000Z"),
    new Date("2024-01-02T00:00:00.000Z"),
  );

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
    mockOrderRepository.findById.mockReturnValue(
      Order.reconstitute(
        1,
        20,
        5,
        OrderStatus.create(OrderStatusMap.PURCHASED),
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );
    mockItemRepository.findById.mockReturnValue(itemRow());

    const dto = shipOrderUsecase(deps, {
      userId: 10,
      orderId: 1,
    });

    expect(mockOrderRepository.findById).toHaveBeenCalledWith(1);
    expect(mockItemRepository.findById).toHaveBeenCalledWith(5);
    expect(mockOrderRepository.update).toHaveBeenCalledTimes(1);
    expect(
      OrderStatus.isShipped(mockOrderRepository.update.mock.calls[0][0].status),
    ).toBe(true);

    expect(mockOrderHistoryRepository.create).toHaveBeenCalledTimes(1);
    const history = mockOrderHistoryRepository.create.mock.calls[0][0];
    expect(history.id).toBeNull();
    expect(history.orderId).toBe(1);

    expect(dto.status).toBe(OrderStatusMap.SHIPPED);
    expect(dto.id).toBe(1);
  });

  it("注文が無いとき NotFoundError とし更新しない", () => {
    mockOrderRepository.findById.mockReturnValue(null);

    expect(() =>
      shipOrderUsecase(deps, { userId: 10, orderId: 999 }),
    ).toThrow(NotFoundError);
    expect(mockOrderRepository.update).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
  });

  it("販売者以外が発送しようとしたとき ValidationError とし更新しない", () => {
    mockOrderRepository.findById.mockReturnValue(
      Order.reconstitute(
        1,
        20,
        5,
        OrderStatus.create(OrderStatusMap.PURCHASED),
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );
    mockItemRepository.findById.mockReturnValue(itemRow());

    expect(() =>
      shipOrderUsecase(deps, { userId: 20, orderId: 1 }),
    ).toThrow(ValidationError);
    expect(mockOrderRepository.update).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
  });

  it("購入済み以外はドメインで ValidationError", () => {
    mockOrderRepository.findById.mockReturnValue(
      Order.reconstitute(
        1,
        20,
        5,
        OrderStatus.create(OrderStatusMap.SHIPPED),
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );
    mockItemRepository.findById.mockReturnValue(itemRow());

    expect(() =>
      shipOrderUsecase(deps, { userId: 10, orderId: 1 }),
    ).toThrow(ValidationError);
  });
});
