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
import { orderDtoSchema, type OrderDto } from "../dto/orderDto.js";

type Deps = {
  readonly db: AppDatabase;
  readonly createOrderRepository: (client: DbClient) => IOrderRepository;
  readonly createOrderHistoryRepository: (
    client: DbClient,
  ) => IOrderHistoryRepository;
};

type Input = {
  readonly orderId: string;
};

export const orderCancel = async (
  deps: Deps,
  input: Input,
): Promise<OrderDto> => {
  return deps.db.transaction(async (tx) => {
    const orderRepository = deps.createOrderRepository(tx);
    const orderHistoryRepository = deps.createOrderHistoryRepository(tx);

    const order = await orderRepository.findById(input.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (!order.status.isPurchased()) {
      throw new Error("Order cannot be canceled");
    }

    const updatedOrder = order.changeStatus(
      OrderStatus.create(OrderStatusMap.CANCELED),
    );
    const history = OrderHistory.create(
      crypto.randomUUID(),
      order.id,
      order.status,
      OrderStatus.create(OrderStatusMap.CANCELED),
    );

    await orderRepository.update(updatedOrder);
    await orderHistoryRepository.create(history);

    const result = orderDtoSchema.parse({
      id: updatedOrder.id,
      userId: updatedOrder.userId,
      itemId: updatedOrder.itemId,
      status: updatedOrder.status.toValue(),
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt,
    });
    return result;
  });
};
