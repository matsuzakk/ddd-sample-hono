import type { IItemRepository } from "../../domain/model/item/IItemRepository.js";
import type {
  AppDatabase,
  DbClient,
} from "../../infrastructure/database/db.js";
import { itemDtoSchema, type ItemDto } from "../dto/itemDto.js";

export type Deps = {
  readonly db: AppDatabase;
  readonly createItemRepository: (client: DbClient) => IItemRepository;
};

export const itemGetAllList = async (deps: Deps): Promise<ItemDto[]> => {
  const items = await deps.createItemRepository(deps.db).findAll();

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
