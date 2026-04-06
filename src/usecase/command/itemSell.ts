import type { IItemRepository } from "../../domain/model/item/IItemRepository.js";
import { Item } from "../../domain/model/item/Item.js";
import { ItemPrice } from "../../domain/model/item/ItemPrice.js";
import type {
  AppDatabase,
  DbClient,
} from "../../infrastructure/database/db.js";
import { itemDtoSchema, type ItemDto } from "../dto/itemDto.js";

type Deps = {
  readonly db: AppDatabase;
  readonly createItemRepository: (client: DbClient) => IItemRepository;
};

type Input = {
  readonly sellerId: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
};

export const itemSell = async (deps: Deps, input: Input): Promise<ItemDto> => {
  const item = Item.create(
    crypto.randomUUID(),
    input.name,
    input.description,
    ItemPrice.create(input.price),
    input.sellerId,
  );
  await deps.createItemRepository(deps.db).create(item);

  const result = itemDtoSchema.parse({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price.toValue(),
    status: item.status.toValue(),
    sellerId: item.sellerId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  });
  return result;
};
