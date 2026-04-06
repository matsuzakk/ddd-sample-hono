import { eq } from "drizzle-orm";
import { Order } from "../../domain/model/order/Order.js";
import { OrderStatus } from "../../domain/model/order/OrderStatus.js";
import { orders } from "./schema.js";
export const createOrderRepository = (db) => ({
    create: async (order) => {
        await db.insert(orders).values({
            id: order.id,
            userId: order.userId,
            itemId: order.itemId,
            status: order.status.toValue(),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        });
    },
    findByUserId: async (userId) => {
        const rows = await db
            .select()
            .from(orders)
            .where(eq(orders.userId, userId));
        return rows.map((row) => Order.reconstitute(row.id, row.userId, row.itemId, OrderStatus.reconstitute(row.status), row.createdAt, row.updatedAt));
    },
    findById: async (id) => {
        const rows = await db
            .select()
            .from(orders)
            .where(eq(orders.id, id))
            .limit(1);
        const row = rows[0];
        if (!row) {
            return null;
        }
        return Order.reconstitute(row.id, row.userId, row.itemId, OrderStatus.reconstitute(row.status), row.createdAt, row.updatedAt);
    },
    update: async (order) => {
        await db
            .update(orders)
            .set({
            status: order.status.toValue(),
            updatedAt: order.updatedAt,
        })
            .where(eq(orders.id, order.id));
    },
});
