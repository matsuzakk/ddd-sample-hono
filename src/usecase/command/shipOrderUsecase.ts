import type { IItemRepository } from "../../domain/model/item/IItemRepository.js";
import { Item } from "../../domain/model/item/Item.js";
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
  readonly orderId: number;
};

export const shipOrderUsecase = (deps: Deps, input: Input): OrderDto => {
  return deps.txManager.run((tx) => {
    const itemRepository = deps.createItemRepository(tx);
    const orderRepository = deps.createOrderRepository(tx);
    const orderHistoryRepository = deps.createOrderHistoryRepository(tx);

    const order = orderRepository.findById(input.orderId);
    // 注文が存在しない場合
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const item = itemRepository.findById(order.itemId);
    // 商品が存在しない場合
    if (!item) {
      throw new NotFoundError("Item not found");
    }
    // 商品の販売者が発送者本人と一致しない場合はエラー
    if (!Item.isSeller(item, input.userId)) {
      throw new ValidationError(
        "You cannot ship this order because you are not the seller",
      );
    }

    // 注文を発送済みにする
    const updatedOrder = Order.markShipped(order);

    // 注文履歴を発行する
    const history = OrderHistory.recordTransition(null, order, updatedOrder);

    orderRepository.update(updatedOrder);
    orderHistoryRepository.create(history);

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
