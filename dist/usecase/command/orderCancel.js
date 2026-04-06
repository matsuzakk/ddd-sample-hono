import { OrderHistory } from "../../domain/model/order/OrderHistory.js";
import { OrderStatus, OrderStatusMap, } from "../../domain/model/order/OrderStatus.js";
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
        return updatedOrder;
    });
};
