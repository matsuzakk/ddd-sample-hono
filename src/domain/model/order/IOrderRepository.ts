import type { Order } from "./Order.js";
import type { OrderHistory } from "./OrderHistory.js";

export interface IOrderRepository {
  create(order: Order): number;
  findById(id: number): Order | null;
  update(order: Order): void;
}

export interface IOrderHistoryRepository {
  create(orderHistory: OrderHistory): void;
}
