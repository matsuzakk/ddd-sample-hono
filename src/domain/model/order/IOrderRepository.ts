import type { Order } from "./Order.js";
import type { OrderHistory } from "./OrderHistory.js";

export interface IOrderRepository {
  create(order: Order): void;
  findByUserId(userId: string): Order[];
  findById(id: string): Order | null;
  update(order: Order): void;
}

export interface IOrderHistoryRepository {
  create(orderHistory: OrderHistory): void;
  findByOrderId(orderId: string): OrderHistory[];
}
