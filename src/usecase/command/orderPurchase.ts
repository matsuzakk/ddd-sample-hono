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
import type {
  AppDatabase,
  DbClient,
} from "../../infrastructure/database/db.js";
import { orderDtoSchema, type OrderDto } from "../dto/orderDto.js";
import { NotFoundError } from "../../domain/model/shared/error.js";

type Deps = {
  readonly db: AppDatabase;
  readonly createItemRepository: (client: DbClient) => IItemRepository;
  readonly createOrderRepository: (client: DbClient) => IOrderRepository;
  readonly createOrderHistoryRepository: (
    client: DbClient,
  ) => IOrderHistoryRepository;
};

type Input = {
  readonly userId: string;
  readonly itemId: string;
};

/**
 * 商品を購入する
 */
export const orderPurchase = (deps: Deps, input: Input): OrderDto => {
  return deps.db.transaction((tx) => {
    const itemRepository = deps.createItemRepository(tx);
    const orderRepository = deps.createOrderRepository(tx);
    const orderHistoryRepository = deps.createOrderHistoryRepository(tx);

    const item = itemRepository.findById(input.itemId);
    if (!item || !Item.isSellable(item)) {
      throw new NotFoundError("Item not found");
    }
    const updatedItem = Item.changeStatus(
      item,
      ItemStatus.create(ItemStatusMap.PURCHASED),
    );
    const order = Order.create(crypto.randomUUID(), input.userId, item);
    const history = OrderHistory.create(
      crypto.randomUUID(),
      order.id,
      null,
      order.status,
    );

    itemRepository.update(updatedItem);
    orderRepository.create(order);
    orderHistoryRepository.create(history);

    return orderDtoSchema.parse({
      id: order.id,
      userId: order.userId,
      itemId: order.itemId,
      status: OrderStatus.toValue(order.status),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  });
};
