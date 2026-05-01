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
import {
  NotFoundError,
  ValidationError,
} from "../../domain/model/shared/error.js";

type Deps = {
  readonly txManager: ITransactionManager<DbClient>;
  readonly createItemRepository: (client: DbClient) => IItemRepository;
  readonly createOrderRepository: (client: DbClient) => IOrderRepository;
  readonly createOrderHistoryRepository: (
    client: DbClient,
  ) => IOrderHistoryRepository;
};

type Input = {
  readonly userId: number;
  readonly itemId: number;
};

export const purchaseItemUsecase = (deps: Deps, input: Input): OrderDto => {
  return deps.txManager.run((tx) => {
    const itemRepository = deps.createItemRepository(tx);
    const orderRepository = deps.createOrderRepository(tx);
    const orderHistoryRepository = deps.createOrderHistoryRepository(tx);

    const item = itemRepository.findById(input.itemId);
    if (!item || !Item.isSellable(item)) {
      throw new NotFoundError("Item not found");
    }

    if (item.sellerId === input.userId) {
      throw new ValidationError("You cannot purchase your own item");
    }

    const updatedItem = Item.changeStatus(
      item,
      ItemStatus.create(ItemStatusMap.PURCHASED),
    );

    const order = Order.create(input.userId, item);

    const orderId = orderRepository.create(order);

    const history = OrderHistory.create(null, orderId, null, order.status);

    itemRepository.update(updatedItem);
    orderHistoryRepository.create(history);

    return orderDtoSchema.parse({
      id: orderId,
      userId: order.userId,
      itemId: order.itemId,
      status: OrderStatus.toValue(order.status),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  });
};
