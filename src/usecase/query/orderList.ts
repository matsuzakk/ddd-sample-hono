import type { IOrderRepository } from "../../domain/model/order/IOrderRepository.js";
import { OrderStatus } from "../../domain/model/order/OrderStatus.js";
import type {
  AppDatabase,
  DbClient,
} from "../../infrastructure/database/db.js";
import { orderDtoSchema } from "../dto/orderDto.js";

type Input = {
  readonly userId: string;
};

type Deps = {
  readonly db: AppDatabase;
  readonly createOrderRepository: (client: DbClient) => IOrderRepository;
};

export const orderList = (deps: Deps, input: Input) => {
  const orders = deps
    .createOrderRepository(deps.db)
    .findByUserId(input.userId);

  const result = orders.map((order) =>
    orderDtoSchema.parse({
      id: order.id,
      userId: order.userId,
      itemId: order.itemId,
      status: OrderStatus.toValue(order.status),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }),
  );
  return result;
};
