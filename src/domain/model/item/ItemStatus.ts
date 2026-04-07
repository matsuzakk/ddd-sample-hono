import type { Brand } from "../shared/brand.js";

export const ItemStatusMap = {
  SELLABLE: 0,
  PURCHASED: 1,
} as const;

export type ItemStatusType =
  (typeof ItemStatusMap)[keyof typeof ItemStatusMap];

/** 商品の状態（0: 出品中, 1: 購入済） */
export type ItemStatus = Brand<ItemStatusType, "ItemStatus">;

const ITEM_STATUS_VALUES: ReadonlySet<number> = new Set([
  ItemStatusMap.SELLABLE,
  ItemStatusMap.PURCHASED,
]);

export const ItemStatus = {
  create(value: ItemStatusType): ItemStatus {
    return value as ItemStatus;
  },

  reconstitute(value: number): ItemStatus {
    if (!ITEM_STATUS_VALUES.has(value)) {
      throw new Error(`Invalid item status: ${value}`);
    }
    return value as ItemStatus;
  },

  toValue(status: ItemStatus): number {
    return status as number;
  },

  equals(a: ItemStatus, b: ItemStatus): boolean {
    return a === b;
  },

  isPurchased(status: ItemStatus): boolean {
    return (status as ItemStatusType) === ItemStatusMap.PURCHASED;
  },

  isSellable(status: ItemStatus): boolean {
    return (status as ItemStatusType) === ItemStatusMap.SELLABLE;
  },
} as const;
