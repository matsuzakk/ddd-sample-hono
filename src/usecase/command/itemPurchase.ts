import type { IItemRepository } from "../../domain/model/item/IItemRepository.js";
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
import type {
  AppDatabase,
  DbClient,
} from "../../infrastructure/database/db.js";
import { orderDtoSchema, type OrderDto } from "../dto/orderDto.js";

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
export const purchaseItem = (deps: Deps, input: Input): OrderDto => {
  return deps.db.transaction((tx) => {
    const itemRepository = deps.createItemRepository(tx);
    const orderRepository = deps.createOrderRepository(tx);
    const orderHistoryRepository = deps.createOrderHistoryRepository(tx);

    const item = itemRepository.findById(input.itemId);
    if (!item || !item.isSellable()) {
      throw new Error("Item not found");
    }
    const updatedItem = item.changeStatus(
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
      status: order.status.toValue(),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  });
};
