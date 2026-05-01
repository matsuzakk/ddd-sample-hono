import { z } from "zod";
import { ValidationError } from "../../shared/error.js";

// --- Zod ブランド（価格）---

const itemPriceSym = Symbol();
const itemPriceSchema = z
  .number()
  .int("Product price must be an integer")
  .min(0, "Product price must be greater than 0")
  .max(999_999, "Product price must be less than 999999")
  .brand(typeof itemPriceSym);

export type ItemPrice = z.infer<typeof itemPriceSchema>;

/**
 * 商品の価格（0円以上999,999円以下の整数）
 * 検証は Zod
 */
export const ItemPrice = {
  create(price: number): ItemPrice {
    const r = itemPriceSchema.safeParse(price);
    if (!r.success) {
      const message = r.error.issues[0]?.message;
      throw new ValidationError(message, { cause: r.error });
    }
    return r.data;
  },

  reconstitute(value: number): ItemPrice {
    const r = itemPriceSchema.safeParse(value);
    if (!r.success) {
      const message = r.error.issues[0]?.message;
      throw new ValidationError(message, { cause: r.error });
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
