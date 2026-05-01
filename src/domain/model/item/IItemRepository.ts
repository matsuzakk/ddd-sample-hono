import type { Item } from "./Item.js";

export interface IItemRepository {
  create(item: Item): number;
  findById(id: number): Item | null;
  update(item: Item): void;
}
