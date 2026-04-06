import type { Order } from "./Order.js";
import type { OrderHistory } from "./OrderHistory.js";

export interface IOrderRepository {
  create(order: Order): Promise<void>;
  findByUserId(userId: string): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  update(order: Order): Promise<void>;
}

export interface IOrderHistoryRepository {
  create(orderHistory: OrderHistory): Promise<void>;
  findByOrderId(orderId: string): Promise<OrderHistory[]>;
}
