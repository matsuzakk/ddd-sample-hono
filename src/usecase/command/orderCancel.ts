import type { IItemRepository } from "../../domain/model/item/IItemRepository.js";
import {
  ItemStatus,
  ItemStatusMap,
} from "../../domain/model/item/ItemStatus.js";
import type {
  IOrderHistoryRepository,
  IOrderRepository,
} from "../../domain/model/order/IOrderRepository.js";
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
  readonly orderId: string;
};

export const orderCancel = async (
  deps: Deps,
  input: Input,
): Promise<OrderDto> => {
  return deps.db.transaction(async (tx) => {
    const itemRepository = deps.createItemRepository(tx);
    const orderRepository = deps.createOrderRepository(tx);
    const orderHistoryRepository = deps.createOrderHistoryRepository(tx);

    const order = await orderRepository.findById(input.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const updatedOrder = order.cancel();
    const history = OrderHistory.recordOrderTransition(
      crypto.randomUUID(),
      order,
      updatedOrder,
    );

    const updatedItem = await itemRepository.findById(order.itemId);
    if (!updatedItem) {
      throw new Error("Item not found");
    }
    const updatedUpdatedItem = updatedItem.changeStatus(
      ItemStatus.create(ItemStatusMap.SELLABLE),
    );

    await orderRepository.update(updatedOrder);
    await orderHistoryRepository.create(history);
    await itemRepository.update(updatedUpdatedItem);

    const result = orderDtoSchema.parse({
      id: updatedOrder.id,
      userId: updatedOrder.userId,
      itemId: updatedOrder.itemId,
      status: updatedOrder.status.toValue(),
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt,
    });
    return result;
  });
};
