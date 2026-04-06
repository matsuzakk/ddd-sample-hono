import type { IOrderRepository } from "../../domain/model/order/IOrderRepository.js";
import type { AppDatabase, DbClient } from "../../infrastructure/database/db.js";

export type Input = {
  readonly userId: string;
};

export type Deps = {
  readonly db: AppDatabase;
  readonly createOrderRepository: (client: DbClient) => IOrderRepository;
};

export const orderList = async (deps: Deps, input: Input) => {
  return deps
    .createOrderRepository(deps.db)
    .findByUserId(input.userId);
};
