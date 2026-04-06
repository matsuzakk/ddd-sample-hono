import { orderDtoSchema } from "../dto/orderDto.js";
export const orderList = async (deps, input) => {
    const orders = await deps
        .createOrderRepository(deps.db)
        .findByUserId(input.userId);
    const result = orders.map((order) => orderDtoSchema.parse({
        id: order.id,
        userId: order.userId,
        itemId: order.itemId,
        status: order.status.toValue(),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    }));
    return result;
};
