import type {
  IOrderHistoryRepository,
  IOrderRepository,
} from "../../domain/model/order/IOrderRepository.js";
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

export const orderDetail = async (
  deps: Deps,
  input: Input,
): Promise<{ order: OrderDto | null; histories: OrderHistoryDto[] }> => {
  const order = await deps
    .createOrderRepository(deps.db)
    .findById(input.orderId);
  if (!order) {
    return { order: null, histories: [] };
  }
  const orderResult = orderDtoSchema.parse({
    id: order.id,
    userId: order.userId,
    itemId: order.itemId,
    status: order.status.toValue(),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });

  const histories = await deps
    .createOrderHistoryRepository(deps.db)
    .findByOrderId(input.orderId);
  const historiesResult = histories.map((history) =>
    orderHistoryDtoSchema.parse({
      id: history.id,
      orderId: history.orderId,
      fromStatus: history.fromStatus.toValue(),
      toStatus: history.toStatus.toValue(),
      createdAt: history.createdAt,
    }),
  );
  return { order: orderResult, histories: historiesResult };
};
