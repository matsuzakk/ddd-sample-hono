export const orderDetail = async (deps, input) => {
    const orderRepository = deps.createOrderRepository(deps.db);
    const orderHistoryRepository = deps.createOrderHistoryRepository(deps.db);
    const order = await orderRepository.findById(input.orderId);
    const histories = await orderHistoryRepository.findByOrderId(input.orderId);
    return { order, histories };
};
