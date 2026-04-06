export const itemSellList = async (deps, input) => {
    return deps.createItemRepository(deps.db).findBySellerId(input.sellerId);
};
