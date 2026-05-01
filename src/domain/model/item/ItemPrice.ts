import { z } from "zod";
import { ValidationError } from "../shared/error.js";

// --- Zod ブランド（価格）---

const itemPriceSym = Symbol();
const itemPriceSchema = z
  .number()
  .int()
  .min(0)
  .max(999_999)
  .brand(typeof itemPriceSym);

export type ItemPrice = z.infer<typeof itemPriceSchema>;

const PRICE_VALIDATION_MESSAGE =
  "Product price must be an integer from 0 to 999999 (JPY)";

/**
 * 商品の価格（0円以上999,999円以下の整数）
 * 検証は Zod
 */
export const ItemPrice = {
  create(price: number): ItemPrice {
    const r = itemPriceSchema.safeParse(price);
    if (!r.success) {
      throw new ValidationError(PRICE_VALIDATION_MESSAGE);
    }
    return r.data;
  },

  reconstitute(value: number): ItemPrice {
    const r = itemPriceSchema.safeParse(value);
    if (!r.success) {
      throw new ValidationError(PRICE_VALIDATION_MESSAGE);
    }
    return r.data;
  },

  isValid(price: number): boolean {
    return itemPriceSchema.safeParse(price).success;
  },

  toValue(price: ItemPrice): number {
    return price as number;
  },

  equals(a: ItemPrice, b: ItemPrice): boolean {
    return a === b;
  },
} as const;
