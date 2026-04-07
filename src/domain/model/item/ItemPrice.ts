import type { Brand } from "../shared/brand.js";

/**
 * 商品の価格（0円以上999,999円以下の整数）
 */
export type ItemPrice = Brand<number, "ItemPrice">;

export const ItemPrice = {
  create(price: number): ItemPrice {
    if (!ItemPrice.isValid(price)) {
      throw new Error(
        "商品の価格は0円以上999,999円以下の整数でなければなりません",
      );
    }
    return price as ItemPrice;
  },

  reconstitute(value: number): ItemPrice {
    if (!ItemPrice.isValid(value)) {
      throw new Error(
        "商品の価格は0円以上999,999円以下の整数でなければなりません",
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
