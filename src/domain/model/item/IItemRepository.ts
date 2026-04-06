import type { Item } from "./Item.js";

export interface IItemRepository {
  create(item: Item): Promise<void>;
  findAll(): Promise<Item[]>;
  findById(id: string): Promise<Item | null>;
  findBySellerId(sellerId: string): Promise<Item[]>;
  update(item: Item): Promise<void>;
}
