import { orderDtoSchema } from "../dto/orderDto.js";
import { orderHistoryDtoSchema, } from "../dto/orderHistoryDto.js";
export const orderDetail = async (deps, input) => {
    const order = await deps
        .createOrderRepository(deps.db)
        .findById(input.orderId);
    if (!order) {
        return { order: null, histories: [] };
    }
    const orderResult = orderDtoSchema.parse({
        id: order.id,
        userId: order.userId,
        itemId: order.itemId,
        status: order.status.toValue(),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    });
    const histories = await deps
        .createOrderHistoryRepository(deps.db)
        .findByOrderId(input.orderId);
    const historiesResult = histories.map((history) => orderHistoryDtoSchema.parse({
        id: history.id,
        orderId: history.orderId,
        fromStatus: history.fromStatus.toValue(),
        toStatus: history.toStatus.toValue(),
        createdAt: history.createdAt,
    }));
    return { order: orderResult, histories: historiesResult };
};
