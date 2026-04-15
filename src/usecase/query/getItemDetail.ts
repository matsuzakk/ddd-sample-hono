import { eq } from "drizzle-orm";
import type { AppDatabase } from "../../infrastructure/database/db.js";
import { items } from "../../infrastructure/database/schema.js";
import { itemDtoSchema, type ItemDto } from "../dto/itemDto.js";

type Deps = {
  readonly db: AppDatabase;
};

type Input = {
  readonly itemId: string;
};

export const getItemDetail = (deps: Deps, input: Input): ItemDto | null => {
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
