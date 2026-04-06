import type {
  IOrderHistoryRepository,
  IOrderRepository,
} from "../../domain/model/order/IOrderRepository.js";
import { OrderHistory } from "../../domain/model/order/OrderHistory.js";
import {
  OrderStatus,
  OrderStatusMap,
} from "../../domain/model/order/OrderStatus.js";
import type {
  AppDatabase,
  DbClient,
} from "../../infrastructure/database/db.js";

export type Deps = {
  readonly db: AppDatabase;
  readonly createOrderRepository: (client: DbClient) => IOrderRepository;
  readonly createOrderHistoryRepository: (
    client: DbClient,
  ) => IOrderHistoryRepository;
};

export type Input = {
  readonly orderId: string;
};

export const orderDelivered = async (deps: Deps, input: Input) => {
  return deps.db.transaction(async (tx) => {
    const orderRepository = deps.createOrderRepository(tx);
    const orderHistoryRepository = deps.createOrderHistoryRepository(tx);

    const order = await orderRepository.findById(input.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (!order.status.isShipped()) {
      throw new Error("Order cannot be delivered");
    }

    const updatedOrder = order.changeStatus(
      OrderStatus.create(OrderStatusMap.DELIVERED),
    );
    const history = OrderHistory.create(
      crypto.randomUUID(),
      order.id,
      order.status,
      OrderStatus.create(OrderStatusMap.DELIVERED),
    );

    await orderRepository.update(updatedOrder);
    await orderHistoryRepository.create(history);

    return updatedOrder;
  });
};
