import type { IItemRepository } from "../../domain/model/item/IItemRepository.js";
import type { AppDatabase, DbClient } from "../../infrastructure/database/db.js";

export type Deps = {
  readonly db: AppDatabase;
  readonly createItemRepository: (client: DbClient) => IItemRepository;
};

export const itemGetAllList = async (deps: Deps) => {
  return deps.createItemRepository(deps.db).findAll();
};
