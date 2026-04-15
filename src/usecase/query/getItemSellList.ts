import { eq } from "drizzle-orm";
import type { AppDatabase } from "../../infrastructure/database/db.js";
import { items } from "../../infrastructure/database/schema.js";
import { itemDtoSchema, type ItemDto } from "../dto/itemDto.js";

type Deps = {
  readonly db: AppDatabase;
};

type Input = {
  readonly sellerId: string;
};

export const getItemSellList = (deps: Deps, input: Input): ItemDto[] => {
  const rows = deps.db
    .select()
    .from(items)
    .where(eq(items.sellerId, input.sellerId))
    .all();
  return rows.map((row) =>
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
};
