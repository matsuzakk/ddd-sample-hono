import { eq } from "drizzle-orm";
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

type Input = {
  readonly itemId: string;
};

export const getItemDetail = (deps: Deps, input: Input): ItemDto | null => {
  // NOT USE REPOSITORY
  // const item = deps.createItemRepository(deps.db).findById(input.itemId);

  // Queryを直接実行する
  const row = deps.db
    .select()
    .from(items)
    .where(eq(items.id, input.itemId))
    .limit(1)
    .all()[0];

  if (!row) {
    return null;
  }
  return itemDtoSchema.parse({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    status: row.status,
    sellerId: row.sellerId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
};
