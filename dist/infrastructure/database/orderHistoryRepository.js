import { eq } from "drizzle-orm";
import { OrderHistory } from "../../domain/model/order/OrderHistory.js";
import { OrderStatus } from "../../domain/model/order/OrderStatus.js";
import { orderHistories } from "./schema.js";
export const createOrderHistoryRepository = (db) => ({
    create: async (orderHistory) => {
        await db.insert(orderHistories).values({
            id: orderHistory.id,
            orderId: orderHistory.orderId,
            fromStatus: orderHistory.fromStatus.toValue(),
            toStatus: orderHistory.toStatus.toValue(),
            createdAt: orderHistory.createdAt,
        });
    },
    findByOrderId: async (orderId) => {
        const rows = await db
            .select()
            .from(orderHistories)
            .where(eq(orderHistories.orderId, orderId));
        return rows.map((row) => OrderHistory.reconstitute(row.id, row.orderId, OrderStatus.reconstitute(row.fromStatus), OrderStatus.reconstitute(row.toStatus), row.createdAt));
    },
});
