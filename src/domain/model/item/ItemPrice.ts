import type { Brand } from "../shared/brand.js";
import { ValidationError } from "../shared/error.js";

/**
 * 商品の価格（0円以上999,999円以下の整数）
 */
export type ItemPrice = Brand<number, "ItemPrice">;

export const ItemPrice = {
  create(price: number): ItemPrice {
    if (!ItemPrice.isValid(price)) {
      throw new ValidationError(
        "Product price must be an integer from 0 to 999999 (JPY)",
      );
    }
    return price as ItemPrice;
  },

  reconstitute(value: number): ItemPrice {
    if (!ItemPrice.isValid(value)) {
      throw new ValidationError(
        "Product price must be an integer from 0 to 999999 (JPY)",
      );
    }
    return value as ItemPrice;
  },

  isValid(price: number): boolean {
    return price >= 0 && price <= 999999;
  },

  toValue(price: ItemPrice): number {
    return price as number;
  },

  equals(a: ItemPrice, b: ItemPrice): boolean {
    return a === b;
  },
} as const;
