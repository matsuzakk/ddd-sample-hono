import type {
  IOrderHistoryRepository,
  IOrderRepository,
} from "../../domain/model/order/IOrderRepository.js";
import { OrderStatus } from "../../domain/model/order/OrderStatus.js";
import type {
  AppDatabase,
  DbClient,
} from "../../infrastructure/database/db.js";
import { orderDtoSchema, type OrderDto } from "../dto/orderDto.js";
import {
  orderHistoryDtoSchema,
  type OrderHistoryDto,
} from "../dto/orderHistoryDto.js";

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

export const getOrderDetail = (
  deps: Deps,
  input: Input,
): { order: OrderDto | null; histories: OrderHistoryDto[] } => {
  const order = deps.createOrderRepository(deps.db).findById(input.orderId);
  if (!order) {
    return { order: null, histories: [] };
  }
  const orderResult = orderDtoSchema.parse({
    id: order.id,
    userId: order.userId,
    itemId: order.itemId,
    status: OrderStatus.toValue(order.status),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });

  const histories = deps
    .createOrderHistoryRepository(deps.db)
    .findByOrderId(input.orderId);
  const historiesResult = histories.map((history) =>
    orderHistoryDtoSchema.parse({
      id: history.id,
      orderId: history.orderId,
      fromStatus:
        history.fromStatus !== null
          ? OrderStatus.toValue(history.fromStatus)
          : null,
      toStatus: OrderStatus.toValue(history.toStatus),
      createdAt: history.createdAt,
    }),
  );
  return { order: orderResult, histories: historiesResult };
};
