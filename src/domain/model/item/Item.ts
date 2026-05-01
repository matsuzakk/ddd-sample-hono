import { z } from "zod";
import { ItemDescription } from "./vo/ItemDescription.js";
import { ItemName } from "./vo/ItemName.js";
import { ItemStatus, ItemStatusMap } from "./vo/ItemStatus.js";
import { ItemPrice } from "./vo/ItemPrice.js";

// --- データ（状態）---

export type Item = Readonly<{
  id: number | null;
  name: ItemName;
  description: ItemDescription;
  price: ItemPrice;
  status: ItemStatus;
  sellerId: number;
  createdAt: Date;
  updatedAt: Date;
}>;

// --- 振る舞い（純粋関数）---

/**
 * 商品を作成する
 * @param name - 商品名
 * @param description - 商品説明
 * @param price - 商品価格
 * @param sellerId - 販売者ID
 * @returns 作成された商品
 */
const create = (
  name: string,
  description: string,
  price: ItemPrice,
  sellerId: number,
): Item => {
  const now = new Date();
  return {
    id: null,
    name: ItemName.create(name),
    description: ItemDescription.create(description),
    price,
    status: ItemStatus.create(ItemStatusMap.SELLABLE),
    sellerId,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * レコードから復元する
 * @param id - 商品ID
 * @param name - 商品名
 * @param description - 商品説明
 * @param price - 商品価格
 * @param status - 商品ステータス
 * @param sellerId - 販売者ID
 * @param createdAt - 作成日時
 * @param updatedAt - 更新日時
 * @returns 復元された商品
 */
const reconstitute = (
  id: number,
  name: string,
  description: string,
  price: ItemPrice,
  status: ItemStatus,
  sellerId: number,
  createdAt: Date,
  updatedAt: Date,
): Item => ({
  id,
  name: ItemName.create(name),
  description: ItemDescription.create(description),
  price,
  status,
  sellerId,
  createdAt,
  updatedAt,
});

/**
 * 商品のステータスを変更する
 * @param item - 商品
 * @param status - 新しいステータス
 * @returns ステータスが変更された商品
 */
const changeStatus = (item: Item, status: ItemStatus): Item => ({
  ...item,
  status,
  updatedAt: new Date(),
});

/**
 * 商品の名前を変更する
 * @param item - 商品
 * @param name - 新しい名前
 * @returns 名前が変更された商品
 */
const changeName = (item: Item, name: string): Item => ({
  ...item,
  name: ItemName.create(name),
  updatedAt: new Date(),
});

/**
 * 商品の説明を変更する
 * @param item - 商品
 * @param description - 新しい説明
 * @returns 説明が変更された商品
 */
const changeDescription = (item: Item, description: string): Item => ({
  ...item,
  description: ItemDescription.create(description),
  updatedAt: new Date(),
});

/**
 * 商品の価格を変更する
 * @param item - 商品
 * @param price - 新しい価格
 * @returns 価格が変更された商品
 */
const changePrice = (item: Item, price: ItemPrice): Item => ({
  ...item,
  price,
  updatedAt: new Date(),
});

/**
 * 商品が購入済みかどうかを判定する
 * @param item - 商品
 * @returns 購入済みかどうか
 */
const isPurchased = (item: Item): boolean =>
  ItemStatus.isPurchased(item.status);

/**
 * 商品が販売可能かどうかを判定する
 * @param item - 商品
 * @returns 販売可能かどうか
 */
const isSellable = (item: Item): boolean => ItemStatus.isSellable(item.status);

/**
 * ユーザーが商品を購入可能かどうかを判定する
 * @param item - 商品
 * @param userId - ユーザーID
 * @returns 購入可能かどうか
 */
const isPurchasableByUser = (item: Item, userId: number): boolean =>
  (item.sellerId as number) !== userId;

/**
 * 操作者がこの商品の販売者本人かどうかを判定する
 * @param item - 商品
 * @param userId - ユーザーID
 * @returns 販売者本人かどうか
 */
const isSeller = (item: Item, userId: number): boolean =>
  (item.sellerId as number) === userId;

// --- エンティティ ---

export const Item = {
  create,
  reconstitute,
  changeStatus,
  changeName,
  changeDescription,
  changePrice,
  isPurchased,
  isSellable,
  isPurchasableByUser,
  isSeller,
} as const;
