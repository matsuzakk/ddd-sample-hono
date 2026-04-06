import { Item } from "../../domain/model/item/Item.js";
import { ItemPrice } from "../../domain/model/item/ItemPrice.js";
import { itemDtoSchema } from "../dto/itemDto.js";
export const itemSell = async (deps, input) => {
    const item = Item.create(crypto.randomUUID(), input.name, input.description, ItemPrice.create(input.price), input.sellerId);
    await deps.createItemRepository(deps.db).create(item);
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
