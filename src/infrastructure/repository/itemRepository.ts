import { eq } from "drizzle-orm";
import type { IItemRepository } from "../../domain/model/item/IItemRepository.js";
import { Item } from "../../domain/model/item/Item.js";
import { ItemDescription } from "../../domain/model/item/ItemDescription.js";
import { ItemName } from "../../domain/model/item/ItemName.js";
import { ItemPrice } from "../../domain/model/item/ItemPrice.js";
import { ItemStatus } from "../../domain/model/item/ItemStatus.js";
import { getDatabase } from "../database/db.js";
import type { DbClient } from "../database/db.js";
import { items } from "../database/schema.js";

export const createItemRepository = (db: DbClient): IItemRepository => ({
  create: (item: Item) => {
    const row = db
      .insert(items)
      .values({
        name: ItemName.toValue(item.name),
        description: ItemDescription.toValue(item.description),
        price: ItemPrice.toValue(item.price),
        status: ItemStatus.toValue(item.status),
        sellerId: item.sellerId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
      .returning({ id: items.id })
      .all()[0];
    if (!row) {
      throw new Error("Failed to insert item");
    }
    return row.id;
  },
  findById: (id: number) => {
    const rows = db.select().from(items).where(eq(items.id, id)).limit(1).all();
    const row = rows[0];

    if (!row) {
      return null;
    }
    return Item.reconstitute(
      row.id,
      row.name,
      row.description,
      ItemPrice.reconstitute(row.price),
      ItemStatus.reconstitute(row.status),
      row.sellerId,
      row.createdAt,
      row.updatedAt,
    );
  },
  update: (item: Item) => {
    if (item.id === null) {
      throw new Error("Cannot update item without id");
    }
    db.update(items)
      .set({
        name: item.name,
        description: item.description,
        price: ItemPrice.toValue(item.price),
        status: ItemStatus.toValue(item.status),
        sellerId: item.sellerId,
        updatedAt: item.updatedAt,
      })
      .where(eq(items.id, item.id))
      .run();
  },
});

export const itemRepository: IItemRepository = createItemRepository(
  getDatabase().db,
);
