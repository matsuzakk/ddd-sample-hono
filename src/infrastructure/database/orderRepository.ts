import { eq } from "drizzle-orm";
import type { IOrderRepository } from "../../domain/model/order/IOrderRepository.js";
import { Order } from "../../domain/model/order/Order.js";
import { OrderStatus } from "../../domain/model/order/OrderStatus.js";
import type { DbClient } from "./db.js";
import { orders } from "./schema.js";

export const createOrderRepository = (db: DbClient): IOrderRepository => ({
  create: (order: Order) => {
    db.insert(orders)
      .values({
        id: order.id,
        userId: order.userId,
        itemId: order.itemId,
        status: order.status.toValue(),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })
      .run();
  },
  findByUserId: (userId: string) => {
    const rows = db.select().from(orders).where(eq(orders.userId, userId)).all();
    return rows.map((row) =>
      Order.reconstitute(
        row.id,
        row.userId,
        row.itemId,
        OrderStatus.reconstitute(row.status),
        row.createdAt,
        row.updatedAt,
      ),
    );
  },
  findById: (id: string) => {
    const rows = db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1)
      .all();
    const row = rows[0];
    if (!row) {
      return null;
    }
    return Order.reconstitute(
      row.id,
      row.userId,
      row.itemId,
      OrderStatus.reconstitute(row.status),
      row.createdAt,
      row.updatedAt,
    );
  },
  update: (order: Order) => {
    db.update(orders)
      .set({
        status: order.status.toValue(),
        updatedAt: order.updatedAt,
      })
      .where(eq(orders.id, order.id))
      .run();
  },
});
