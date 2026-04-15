import type { IItemRepository } from "../../domain/model/item/IItemRepository.js";
import { Item } from "../../domain/model/item/Item.js";
import {
  ItemStatus,
  ItemStatusMap,
} from "../../domain/model/item/ItemStatus.js";
import type {
  IOrderHistoryRepository,
  IOrderRepository,
} from "../../domain/model/order/IOrderRepository.js";
import { Order } from "../../domain/model/order/Order.js";
import { OrderHistory } from "../../domain/model/order/OrderHistory.js";
import { OrderStatus } from "../../domain/model/order/OrderStatus.js";
import type { ITransactionManager } from "../../domain/model/shared/ITransactionManager.js";
import type { DbClient } from "../../infrastructure/database/db.js";
import { orderDtoSchema, type OrderDto } from "../dto/orderDto.js";
import { NotFoundError } from "../../domain/model/shared/error.js";

type Deps = {
  readonly txManager: ITransactionManager<DbClient>;
  readonly createItemRepository: (client: DbClient) => IItemRepository;
  readonly createOrderRepository: (client: DbClient) => IOrderRepository;
  readonly createOrderHistoryRepository: (
    client: DbClient,
  ) => IOrderHistoryRepository;
};

type Input = {
  readonly orderId: string;
};

export const cancelOrder = (deps: Deps, input: Input): OrderDto => {
  return deps.txManager.run((tx) => {
    const itemRepository = deps.createItemRepository(tx);
    const orderRepository = deps.createOrderRepository(tx);
    const orderHistoryRepository = deps.createOrderHistoryRepository(tx);

    const order = orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const updatedOrder = Order.cancel(order);
    const history = OrderHistory.recordTransition(
      crypto.randomUUID(),
      order,
      updatedOrder,
    );

    const updatedItem = itemRepository.findById(order.itemId);
    if (!updatedItem) {
      throw new NotFoundError("Item not found");
    }
    const updatedUpdatedItem = Item.changeStatus(
      updatedItem,
      ItemStatus.create(ItemStatusMap.SELLABLE),
    );

    orderRepository.update(updatedOrder);
    orderHistoryRepository.create(history);
    itemRepository.update(updatedUpdatedItem);

    return orderDtoSchema.parse({
      id: updatedOrder.id,
      userId: updatedOrder.userId,
      itemId: updatedOrder.itemId,
      status: OrderStatus.toValue(updatedOrder.status),
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt,
    });
  });
};
