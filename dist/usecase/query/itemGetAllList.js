export const itemGetAllList = async (deps) => {
    return deps.createItemRepository(deps.db).findAll();
};
