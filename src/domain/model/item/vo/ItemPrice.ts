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

// --- Value Object(コンパニオンオブジェクト) ---

export const ItemPrice = {
  create(price: number): ItemPrice {
    const r = itemPriceSchema.safeParse(price);
    if (!r.success) {
      const message = r.error.issues[0]?.message;
      throw new ValidationError(message, { cause: r.error });
    }
    return r.data;
  },

  toValue(price: ItemPrice): number {
    return price as number;
  },

  equals(a: ItemPrice, b: ItemPrice): boolean {
    return a === b;
  },
} as const;
