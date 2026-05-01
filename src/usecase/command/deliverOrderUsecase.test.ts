import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
import { deliverOrderUsecase } from "./deliverOrderUsecase.js";

type DeliverOrderDeps = Parameters<typeof deliverOrderUsecase>[0];

describe("deliverOrder", () => {
  let mockOrderRepository: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let mockOrderHistoryRepository: { create: ReturnType<typeof vi.fn> };
  let deps: DeliverOrderDeps;

  beforeEach(() => {
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
      createOrderRepository: vi.fn(() => mockOrderRepository),
      createOrderHistoryRepository: vi.fn(() => mockOrderHistoryRepository),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("発送済み注文を到着済みにし履歴を残す", () => {
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

    const dto = deliverOrderUsecase(deps, {
      userId: 20,
      orderId: 1,
    });

    expect(mockOrderRepository.update).toHaveBeenCalledTimes(1);
    expect(
      OrderStatus.isDelivered(
        mockOrderRepository.update.mock.calls[0][0].status,
      ),
    ).toBe(true);

    expect(mockOrderHistoryRepository.create).toHaveBeenCalledTimes(1);
    expect(dto.status).toBe(OrderStatusMap.DELIVERED);
  });

  it("注文が無いとき NotFoundError とし更新しない", () => {
    mockOrderRepository.findById.mockReturnValue(null);

    expect(() =>
      deliverOrderUsecase(deps, { userId: 20, orderId: 999 }),
    ).toThrow(NotFoundError);
    expect(mockOrderRepository.update).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
  });

  it("購入者以外が受取完了にしようとしたとき NotFoundError とし更新しない", () => {
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

    expect(() =>
      deliverOrderUsecase(deps, { userId: 99, orderId: 1 }),
    ).toThrow(NotFoundError);
    expect(mockOrderRepository.update).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
  });

  it("発送済み以外はドメインで ValidationError", () => {
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

    expect(() =>
      deliverOrderUsecase(deps, { userId: 20, orderId: 1 }),
    ).toThrow(ValidationError);
  });
});
