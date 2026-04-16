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
import { shipOrder } from "./shipOrder.js";

type ShipOrderDeps = Parameters<typeof shipOrder>[0];

describe("shipOrder", () => {
  let mockOrderRepository: {
    findById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let mockOrderHistoryRepository: { create: ReturnType<typeof vi.fn> };
  let deps: ShipOrderDeps;

  beforeEach(() => {
    mockOrderRepository = {
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

  it("購入済み注文を発送済みにし履歴を残す", () => {
    // 準備: 購入済み注文と履歴用 UUID
    mockOrderRepository.findById.mockReturnValue(
      Order.reconstitute(
        "order-1",
        "user-1",
        "item-1",
        OrderStatus.create(OrderStatusMap.PURCHASED),
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );
    vi.spyOn(crypto, "randomUUID").mockReturnValue("hist-1");

    // 実行
    const dto = shipOrder(deps, { orderId: "order-1" });

    // 検証: 注文の更新
    expect(mockOrderRepository.findById).toHaveBeenCalledWith("order-1");
    expect(mockOrderRepository.update).toHaveBeenCalledTimes(1);
    expect(
      OrderStatus.isShipped(mockOrderRepository.update.mock.calls[0][0].status),
    ).toBe(true);

    // 検証: 履歴
    expect(mockOrderHistoryRepository.create).toHaveBeenCalledTimes(1);
    const history = mockOrderHistoryRepository.create.mock.calls[0][0];
    expect(history.id).toBe("hist-1");
    expect(history.orderId).toBe("order-1");

    // 検証: DTO
    expect(dto.status).toBe(OrderStatusMap.SHIPPED);
    expect(dto.id).toBe("order-1");
  });

  it("注文が無いとき NotFoundError とし更新しない", () => {
    // 準備: 未ヒット
    mockOrderRepository.findById.mockReturnValue(null);

    // 実行 & 検証
    expect(() => shipOrder(deps, { orderId: "missing" })).toThrow(
      NotFoundError,
    );
    expect(mockOrderRepository.update).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
  });

  it("購入済み以外はドメインで ValidationError", () => {
    // 準備: すでに発送済み
    mockOrderRepository.findById.mockReturnValue(
      Order.reconstitute(
        "order-1",
        "user-1",
        "item-1",
        OrderStatus.create(OrderStatusMap.SHIPPED),
        new Date("2024-01-01T00:00:00.000Z"),
        new Date("2024-01-02T00:00:00.000Z"),
      ),
    );

    // 実行 & 検証
    expect(() => shipOrder(deps, { orderId: "order-1" })).toThrow(
      ValidationError,
    );
  });
});
