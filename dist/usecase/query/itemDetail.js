import { itemDtoSchema } from "../dto/itemDto.js";
export const itemDetail = async (deps, input) => {
    const item = await deps.createItemRepository(deps.db).findById(input.itemId);
    if (!item) {
        return null;
    }
    const result = itemDtoSchema.parse({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price.toValue(),
        status: item.status.toValue(),
        sellerId: item.sellerId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    });
    return result;
};
