import { eq } from "drizzle-orm";
import type { IOrderRepository } from "../../domain/model/order/IOrderRepository.js";
import { Order } from "../../domain/model/order/Order.js";
import { OrderStatus } from "../../domain/model/order/vo/OrderStatus.js";
import type { DbClient } from "../database/db.js";
import { orders } from "../database/schema.js";

export const createOrderRepository = (db: DbClient): IOrderRepository => ({
  create: (order: Order) => {
    const row = db
      .insert(orders)
      .values({
        userId: order.userId,
        itemId: order.itemId,
        status: OrderStatus.toValue(order.status),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })
      .returning({ id: orders.id })
      .all()[0];
    if (!row) {
      throw new Error("Failed to insert order");
    }
    return row.id;
  },
  findById: (id: number) => {
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
    if (order.id === null) {
      throw new Error("Cannot update order without id");
    }
    db.update(orders)
      .set({
        status: OrderStatus.toValue(order.status),
        updatedAt: order.updatedAt,
      })
      .where(eq(orders.id, order.id))
      .run();
  },
});
