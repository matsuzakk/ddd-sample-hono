import type {
  IOrderHistoryRepository,
  IOrderRepository,
} from "../../domain/model/order/IOrderRepository.js";
import { Order } from "../../domain/model/order/Order.js";
import { OrderHistory } from "../../domain/model/order/OrderHistory.js";
import { OrderStatus } from "../../domain/model/order/OrderStatus.js";
import type {
  AppDatabase,
  DbClient,
} from "../../infrastructure/database/db.js";
import { orderDtoSchema, type OrderDto } from "../dto/orderDto.js";
import { NotFoundError } from "../../domain/model/shared/error.js";

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

export const shipOrder = (deps: Deps, input: Input): OrderDto => {
  return deps.db.transaction((tx) => {
    const orderRepository = deps.createOrderRepository(tx);
    const orderHistoryRepository = deps.createOrderHistoryRepository(tx);

    const order = orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const updatedOrder = Order.markShipped(order);
    const history = OrderHistory.recordTransition(
      crypto.randomUUID(),
      order,
      updatedOrder,
    );

    orderRepository.update(updatedOrder);
    orderHistoryRepository.create(history);

    return orderDtoSchema.parse({
      id: updatedOrder.id,
      userId: updatedOrder.userId,
      itemId: updatedOrder.itemId,
      status: OrderStatus.toValue(updatedOrder.status),
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt,
    });
  });
};
