import type { IItemRepository } from "../../domain/model/item/IItemRepository.js";
import { ItemPrice } from "../../domain/model/item/ItemPrice.js";
import { ItemStatus } from "../../domain/model/item/ItemStatus.js";
import type {
  AppDatabase,
  DbClient,
} from "../../infrastructure/database/db.js";
import { items } from "../../infrastructure/database/schema.js";
import { itemDtoSchema, type ItemDto } from "../dto/itemDto.js";

type Deps = {
  readonly db: AppDatabase;
};

export const getItemAllList = (deps: Deps): ItemDto[] => {
  // NOT USE REPOSITORY
  // const items = deps.createItemRepository(deps.db).findAll();

  // Queryを直接実行する
  const rows = deps.db.select().from(items).all();

  const result = rows.map((row) =>
    itemDtoSchema.parse({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      status: row.status,
      sellerId: row.sellerId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }),
  );
  return result;
};
