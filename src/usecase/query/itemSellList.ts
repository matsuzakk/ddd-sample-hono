import type { IItemRepository } from "../../domain/model/item/IItemRepository.js";
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
};

export const itemSellList = (deps: Deps, input: Input): ItemDto[] => {
  const items = deps
    .createItemRepository(deps.db)
    .findBySellerId(input.sellerId);

  const result = items.map((item) =>
    itemDtoSchema.parse({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price.toValue(),
      status: item.status.toValue(),
      sellerId: item.sellerId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }),
  );
  return result;
};
