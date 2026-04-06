import { itemDtoSchema } from "../dto/itemDto.js";
export const itemGetAllList = async (deps) => {
    const items = await deps.createItemRepository(deps.db).findAll();
    const result = items.map((item) => itemDtoSchema.parse({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price.toValue(),
        status: item.status.toValue(),
        sellerId: item.sellerId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    }));
    return result;
};
