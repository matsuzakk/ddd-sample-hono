import type { AppDatabase } from "../../infrastructure/database/db.js";
import { items } from "../../infrastructure/database/schema.js";
import { itemDtoSchema, type ItemDto } from "../dto/itemDto.js";

type Deps = {
  readonly db: AppDatabase;
};

export const getItemAllList = (deps: Deps): ItemDto[] => {
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
