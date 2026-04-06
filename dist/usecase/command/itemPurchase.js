import { ItemStatus, ItemStatusMap, } from "../../domain/model/item/ItemStatus.js";
import { Order } from "../../domain/model/order/Order.js";
import { OrderHistory } from "../../domain/model/order/OrderHistory.js";
import { OrderStatus, OrderStatusMap, } from "../../domain/model/order/OrderStatus.js";
import { orderDtoSchema } from "../dto/orderDto.js";
/**
 * 商品を購入する
 */
export const purchaseItem = async (deps, input) => {
    return deps.db.transaction(async (tx) => {
        const itemRepository = deps.createItemRepository(tx);
        const orderRepository = deps.createOrderRepository(tx);
        const orderHistoryRepository = deps.createOrderHistoryRepository(tx);
        const item = await itemRepository.findById(input.itemId);
        if (!item || !item.isSellable()) {
            throw new Error("Item not found");
        }
        const updatedItem = item.changeStatus(ItemStatus.create(ItemStatusMap.PURCHASED));
        const order = Order.create(crypto.randomUUID(), input.userId, item);
        const history = OrderHistory.create(crypto.randomUUID(), order.id, order.status, OrderStatus.create(OrderStatusMap.PURCHASED));
        await itemRepository.update(updatedItem);
        await orderRepository.create(order);
        await orderHistoryRepository.create(history);
        const result = orderDtoSchema.parse({
            id: order.id,
            userId: order.userId,
            itemId: order.itemId,
            status: order.status.toValue(),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        });
        return result;
    });
};
