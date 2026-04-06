export const orderList = async (deps, input) => {
    return deps
        .createOrderRepository(deps.db)
        .findByUserId(input.userId);
};
