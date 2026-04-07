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

export const orderShip = async (
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

    const updatedOrder = order.markShipped();
    const history = OrderHistory.recordOrderTransition(
      crypto.randomUUID(),
      order,
      updatedOrder,
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
