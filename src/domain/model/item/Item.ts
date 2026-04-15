import { ValidationError } from "../shared/error.js";
import {
  ItemStatus,
  ItemStatusMap,
  type ItemStatus as ItemStatusVO,
} from "./ItemStatus.js";
import type { ItemPrice as ItemPriceVO } from "./ItemPrice.js";

export type Item = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: ItemPriceVO;
  readonly status: ItemStatusVO;
  readonly sellerId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

function isValidName(name: string): boolean {
  return name.length >= 1 && name.length <= 20;
}

function isValidDescription(description: string): boolean {
  return description.length >= 1 && description.length <= 1000;
}

export const Item = {
  create(
    id: string,
    name: string,
    description: string,
    price: ItemPriceVO,
    sellerId: string,
  ): Item {
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
      id,
      name,
      description,
      price,
      status: ItemStatus.create(ItemStatusMap.SELLABLE),
      sellerId,
      createdAt: now,
      updatedAt: now,
    };
  },

  reconstitute(
    id: string,
    name: string,
    description: string,
    price: ItemPriceVO,
    status: ItemStatusVO,
    sellerId: string,
    createdAt: Date,
    updatedAt: Date,
  ): Item {
    return {
      id,
      name,
      description,
      price,
      status,
      sellerId,
      createdAt,
      updatedAt,
    };
  },

  isPurchased(item: Item): boolean {
    return ItemStatus.isPurchased(item.status);
  },

  isSellable(item: Item): boolean {
    return ItemStatus.isSellable(item.status);
  },

  isPurchasableByUser(item: Item, userId: string): boolean {
    return item.sellerId !== userId;
  },

  changeStatus(item: Item, status: ItemStatusVO): Item {
    return {
      ...item,
      status,
      updatedAt: new Date(),
    };
  },

  changeName(item: Item, name: string): Item {
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
  },

  changeDescription(item: Item, description: string): Item {
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
  },

  changePrice(item: Item, price: ItemPriceVO): Item {
    return {
      ...item,
      price,
      updatedAt: new Date(),
    };
  },
} as const;
