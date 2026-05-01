import { z } from "zod";
import { ValidationError } from "../shared/error.js";

export const ItemStatusMap = {
  SELLABLE: 0,
  PURCHASED: 1,
} as const;

export type ItemStatusType = (typeof ItemStatusMap)[keyof typeof ItemStatusMap];

// --- Zod ブランド（商品ステータス）---

const itemStatusSym = Symbol();
const itemStatusSchema = z
  .union([
    z.literal(ItemStatusMap.SELLABLE),
    z.literal(ItemStatusMap.PURCHASED),
  ])
  .brand(typeof itemStatusSym);

export type ItemStatus = z.infer<typeof itemStatusSchema>;

const invalidMessage = (value: number): string =>
  `Invalid item status: ${value}`;

// --- Value Object ---

export const ItemStatus = {
  create(value: ItemStatusType): ItemStatus {
    const r = itemStatusSchema.safeParse(value);
    if (!r.success) {
      throw new ValidationError(invalidMessage(value as number));
    }
    return r.data;
  },

  reconstitute(value: number): ItemStatus {
    const r = itemStatusSchema.safeParse(value);
    if (!r.success) {
      throw new ValidationError(invalidMessage(value));
    }
    return r.data;
  },

  isValid(value: number): boolean {
    return itemStatusSchema.safeParse(value).success;
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
