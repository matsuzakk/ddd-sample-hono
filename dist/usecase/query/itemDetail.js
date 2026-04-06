export const itemDetail = async (deps, input) => {
    return deps.createItemRepository(deps.db).findById(input.itemId);
};
