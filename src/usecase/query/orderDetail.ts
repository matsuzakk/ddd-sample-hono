import type {
  IOrderHistoryRepository,
  IOrderRepository,
} from "../../domain/model/order/IOrderRepository.js";
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

export const orderDetail = async (deps: Deps, input: Input) => {
  const orderRepository = deps.createOrderRepository(deps.db);
  const orderHistoryRepository = deps.createOrderHistoryRepository(deps.db);
  const order = await orderRepository.findById(input.orderId);
  const histories = await orderHistoryRepository.findByOrderId(input.orderId);
  return { order, histories };
};
