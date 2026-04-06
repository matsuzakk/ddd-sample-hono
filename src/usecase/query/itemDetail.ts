import type { IItemRepository } from "../../domain/model/item/IItemRepository.js";
import type {
  AppDatabase,
  DbClient,
} from "../../infrastructure/database/db.js";

export type Deps = {
  readonly db: AppDatabase;
  readonly createItemRepository: (client: DbClient) => IItemRepository;
};

export type Input = {
  readonly itemId: string;
};

export const itemDetail = async (deps: Deps, input: Input) => {
  return deps.createItemRepository(deps.db).findById(input.itemId);
};
