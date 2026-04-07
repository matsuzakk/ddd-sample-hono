import type { Item } from "./Item.js";

export interface IItemRepository {
  create(item: Item): void;
  findAll(): Item[];
  findById(id: string): Item | null;
  findBySellerId(sellerId: string): Item[];
  update(item: Item): void;
}
