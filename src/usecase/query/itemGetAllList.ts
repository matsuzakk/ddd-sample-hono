import type { IItemRepository } from "../../domain/model/item/IItemRepository.js";
import { ItemPrice } from "../../domain/model/item/ItemPrice.js";
import { ItemStatus } from "../../domain/model/item/ItemStatus.js";
import type {
  AppDatabase,
  DbClient,
} from "../../infrastructure/database/db.js";
import { itemDtoSchema, type ItemDto } from "../dto/itemDto.js";

type Deps = {
  readonly db: AppDatabase;
  readonly createItemRepository: (client: DbClient) => IItemRepository;
};

export const itemGetAllList = (deps: Deps): ItemDto[] => {
  const items = deps.createItemRepository(deps.db).findAll();

  const result = items.map((item) =>
    itemDtoSchema.parse({
      id: item.id,
      name: item.name,
      description: item.description,
      price: ItemPrice.toValue(item.price),
      status: ItemStatus.toValue(item.status),
      sellerId: item.sellerId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }),
  );
  return result;
};
