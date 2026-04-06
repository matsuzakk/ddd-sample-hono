import { eq } from "drizzle-orm";
import { Item } from "../../domain/model/item/Item.js";
import { ItemPrice } from "../../domain/model/item/ItemPrice.js";
import { ItemStatus } from "../../domain/model/item/ItemStatus.js";
import { getDatabase } from "./db.js";
import { items } from "./schema.js";
export const createItemRepository = (db) => ({
    create: async (item) => {
        await db.insert(items).values({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price.toValue(),
            status: item.status.toValue(),
            sellerId: item.sellerId,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        });
    },
    findAll: async () => {
        const rows = await db.select().from(items);
        return rows.map((row) => Item.reconstitute(row.id, row.name, row.description, ItemPrice.reconstitute(row.price), ItemStatus.reconstitute(row.status), row.sellerId, row.createdAt, row.updatedAt));
    },
    findById: async (id) => {
        const rows = await db.select().from(items).where(eq(items.id, id)).limit(1);
        const row = rows[0];
        if (!row) {
            return null;
        }
        return Item.reconstitute(row.id, row.name, row.description, ItemPrice.reconstitute(row.price), ItemStatus.reconstitute(row.status), row.sellerId, row.createdAt, row.updatedAt);
    },
    findBySellerId: async (sellerId) => {
        const rows = await db
            .select()
            .from(items)
            .where(eq(items.sellerId, sellerId));
        return rows.map((row) => Item.reconstitute(row.id, row.name, row.description, ItemPrice.reconstitute(row.price), ItemStatus.reconstitute(row.status), row.sellerId, row.createdAt, row.updatedAt));
    },
    update: async (item) => {
        await db
            .update(items)
            .set({
            name: item.name,
            description: item.description,
            price: item.price.toValue(),
            status: item.status.toValue(),
            sellerId: item.sellerId,
            updatedAt: item.updatedAt,
        })
            .where(eq(items.id, item.id));
    },
});
export const itemRepository = createItemRepository(getDatabase().db);
