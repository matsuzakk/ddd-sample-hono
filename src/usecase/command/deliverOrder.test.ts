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
import { deliverOrder } from "./deliverOrder.js";

type DeliverOrderDeps = Parameters<typeof deliverOrder>[0];

describe("deliverOrder", () => {
  let mockOrderRepository: {
    findById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let mockOrderHistoryRepository: { create: ReturnType<typeof vi.fn> };
  let deps: DeliverOrderDeps;

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

  it("発送済み注文を到着済みにし履歴を残す", () => {
    // 準備: 発送済み注文
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
    vi.spyOn(crypto, "randomUUID").mockReturnValue("hist-d-1");

    // 実行
    const dto = deliverOrder(deps, { orderId: "order-1" });

    // 検証: 注文の更新
    expect(mockOrderRepository.update).toHaveBeenCalledTimes(1);
    expect(
      OrderStatus.isDelivered(
        mockOrderRepository.update.mock.calls[0][0].status,
      ),
    ).toBe(true);

    // 検証: 履歴と DTO
    expect(mockOrderHistoryRepository.create).toHaveBeenCalledTimes(1);
    expect(dto.status).toBe(OrderStatusMap.DELIVERED);
  });

  it("注文が無いとき NotFoundError とし更新しない", () => {
    // 準備: 未ヒット
    mockOrderRepository.findById.mockReturnValue(null);

    // 実行 & 検証
    expect(() => deliverOrder(deps, { orderId: "missing" })).toThrow(
      NotFoundError,
    );
    expect(mockOrderRepository.update).not.toHaveBeenCalled();
    expect(mockOrderHistoryRepository.create).not.toHaveBeenCalled();
  });

  it("発送済み以外はドメインで ValidationError", () => {
    // 準備: まだ発送前（購入済みのみ）
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

    // 実行 & 検証
    expect(() => deliverOrder(deps, { orderId: "order-1" })).toThrow(
      ValidationError,
    );
  });
});
