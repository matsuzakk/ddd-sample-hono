import { Item } from "../../domain/model/item/Item.js";
import { ItemPrice } from "../../domain/model/item/ItemPrice.js";
export const itemSell = async (deps, input) => {
    const item = Item.create(crypto.randomUUID(), input.name, input.description, ItemPrice.create(input.price), input.sellerId);
    await deps.createItemRepository(deps.db).create(item);
    return item;
};
