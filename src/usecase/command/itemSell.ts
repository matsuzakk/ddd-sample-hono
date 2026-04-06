import type { IItemRepository } from "../../domain/model/item/IItemRepository.js";
import { Item } from "../../domain/model/item/Item.js";
import { ItemPrice } from "../../domain/model/item/ItemPrice.js";
import type {
  AppDatabase,
  DbClient,
} from "../../infrastructure/database/db.js";

export type Deps = {
  readonly db: AppDatabase;
  readonly createItemRepository: (client: DbClient) => IItemRepository;
};

export type Input = {
  readonly sellerId: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
};

export const itemSell = async (deps: Deps, input: Input) => {
  const item = Item.create(
    crypto.randomUUID(),
    input.name,
    input.description,
    ItemPrice.create(input.price),
    input.sellerId,
  );
  await deps.createItemRepository(deps.db).create(item);
  return item;
};
