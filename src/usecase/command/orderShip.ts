import type {
  IOrderHistoryRepository,
  IOrderRepository,
} from "../../domain/model/order/IOrderRepository.js";
import { OrderHistory } from "../../domain/model/order/OrderHistory.js";
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

export const orderShip = (deps: Deps, input: Input): OrderDto => {
  return deps.db.transaction((tx) => {
    const orderRepository = deps.createOrderRepository(tx);
    const orderHistoryRepository = deps.createOrderHistoryRepository(tx);

    const order = orderRepository.findById(input.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const updatedOrder = order.markShipped();
    const history = OrderHistory.recordOrderTransition(
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
      status: updatedOrder.status.toValue(),
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt,
    });
  });
};
