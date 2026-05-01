import { z } from "zod";
import { ValidationError } from "../../shared/error.js";

// --- Zod ブランド（商品ステータス）---

export const ItemStatusMap = {
  SELLABLE: 0,
  PURCHASED: 1,
} as const;

const itemStatusSym = Symbol();
const itemStatusSchema = z
  .union(
    [z.literal(ItemStatusMap.SELLABLE), z.literal(ItemStatusMap.PURCHASED)],
    { error: "Invalid item status" },
  )
  .brand(typeof itemStatusSym);

export type ItemStatus = z.infer<typeof itemStatusSchema>;

// --- Value Object ---

export const ItemStatus = {
  create(value: number): ItemStatus {
    const r = itemStatusSchema.safeParse(value);
    if (!r.success) {
      const message = r.error.issues[0]?.message;
      throw new ValidationError(message, { cause: r.error });
    }
    return r.data;
  },

  toValue(status: ItemStatus): number {
    return status as number;
  },

  equals(a: ItemStatus, b: ItemStatus): boolean {
    return a === b;
  },

  isPurchased(status: ItemStatus): boolean {
    return ItemStatus.toValue(status) === ItemStatusMap.PURCHASED;
  },

  isSellable(status: ItemStatus): boolean {
    return ItemStatus.toValue(status) === ItemStatusMap.SELLABLE;
  },
} as const;
