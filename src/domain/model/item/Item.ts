import { z } from "zod";
import { ValidationError } from "../shared/error.js";
import {
  ItemStatus,
  ItemStatusMap,
  type ItemStatus as ItemStatusVO,
} from "./ItemStatus.js";
import type { ItemPrice as ItemPriceVO } from "./ItemPrice.js";

// --- Zod ブランド（ID）---

const itemRecordIdSym = Symbol();
export const ItemRecordId = z
  .union([z.number().int().positive(), z.null()])
  .brand(typeof itemRecordIdSym);
export type ItemRecordId = z.infer<typeof ItemRecordId>;

const itemSellerIdSym = Symbol();
export const ItemSellerId = z
  .number()
  .int()
  .positive()
  .brand(typeof itemSellerIdSym);
export type ItemSellerId = z.infer<typeof ItemSellerId>;

// --- データ（状態）---

export type Item = Readonly<{
  id: ItemRecordId;
  name: string;
  description: string;
  price: ItemPriceVO;
  status: ItemStatusVO;
  sellerId: ItemSellerId;
  createdAt: Date;
  updatedAt: Date;
}>;

// --- 振る舞い（純粋関数）---

const isValidName = (name: string): boolean =>
  name.length >= 1 && name.length <= 20;

const isValidDescription = (description: string): boolean =>
  description.length >= 1 && description.length <= 1000;

const create = (
  name: string,
  description: string,
  price: ItemPriceVO,
  sellerId: number,
): Item => {
  if (!isValidName(name)) {
    throw new ValidationError(
      "Product name must be between 1 and 20 characters",
    );
  }
  if (!isValidDescription(description)) {
    throw new ValidationError(
      "Product description must be between 1 and 1000 characters",
    );
  }
  const now = new Date();
  return {
    id: ItemRecordId.parse(null),
    name,
    description,
    price,
    status: ItemStatus.create(ItemStatusMap.SELLABLE),
    sellerId: ItemSellerId.parse(sellerId),
    createdAt: now,
    updatedAt: now,
  };
};

const reconstitute = (
  id: number,
  name: string,
  description: string,
  price: ItemPriceVO,
  status: ItemStatusVO,
  sellerId: number,
  createdAt: Date,
  updatedAt: Date,
): Item => ({
  id: ItemRecordId.parse(id),
  name,
  description,
  price,
  status,
  sellerId: ItemSellerId.parse(sellerId),
  createdAt,
  updatedAt,
});

const isPurchased = (item: Item): boolean =>
  ItemStatus.isPurchased(item.status);

const isSellable = (item: Item): boolean => ItemStatus.isSellable(item.status);

const isPurchasableByUser = (item: Item, userId: number): boolean =>
  (item.sellerId as number) !== userId;

/** 操作者がこの商品の販売者本人か（発送などの可否判定用） */
const isSeller = (item: Item, userId: number): boolean =>
  (item.sellerId as number) === userId;

const changeStatus = (item: Item, status: ItemStatusVO): Item => ({
  ...item,
  status,
  updatedAt: new Date(),
});

const changeName = (item: Item, name: string): Item => {
  if (!isValidName(name)) {
    throw new ValidationError(
      "Product name must be between 1 and 20 characters",
    );
  }
  return {
    ...item,
    name,
    updatedAt: new Date(),
  };
};

const changeDescription = (item: Item, description: string): Item => {
  if (!isValidDescription(description)) {
    throw new ValidationError(
      "Product description must be between 1 and 1000 characters",
    );
  }
  return {
    ...item,
    description,
    updatedAt: new Date(),
  };
};

const changePrice = (item: Item, price: ItemPriceVO): Item => ({
  ...item,
  price,
  updatedAt: new Date(),
});

// --- エンティティ(コンパニオンオブジェクト) ---

export const Item = {
  create,
  reconstitute,
  isPurchased,
  isSellable,
  isPurchasableByUser,
  isSeller,
  changeStatus,
  changeName,
  changeDescription,
  changePrice,
} as const;
