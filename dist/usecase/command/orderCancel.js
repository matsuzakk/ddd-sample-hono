import { OrderHistory } from "../../domain/model/order/OrderHistory.js";
import { OrderStatus, OrderStatusMap, } from "../../domain/model/order/OrderStatus.js";
import { orderDtoSchema } from "../dto/orderDto.js";
export const orderCancel = async (deps, input) => {
    return deps.db.transaction(async (tx) => {
        const orderRepository = deps.createOrderRepository(tx);
        const orderHistoryRepository = deps.createOrderHistoryRepository(tx);
        const order = await orderRepository.findById(input.orderId);
        if (!order) {
            throw new Error("Order not found");
        }
        if (!order.status.isPurchased()) {
            throw new Error("Order cannot be canceled");
        }
        const updatedOrder = order.changeStatus(OrderStatus.create(OrderStatusMap.CANCELED));
        const history = OrderHistory.create(crypto.randomUUID(), order.id, order.status, OrderStatus.create(OrderStatusMap.CANCELED));
        await orderRepository.update(updatedOrder);
        await orderHistoryRepository.create(history);
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
