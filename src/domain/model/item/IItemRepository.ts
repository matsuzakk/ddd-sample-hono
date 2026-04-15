import type { Item } from "./Item.js";

export interface IItemRepository {
  create(item: Item): void;
  findById(id: string): Item | null;
  update(item: Item): void;
}
