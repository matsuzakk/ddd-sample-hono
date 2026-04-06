import type { ItemPrice } from "./ItemPrice.js";
import { ItemStatus, ItemStatusMap } from "./ItemStatus.js";

export class Item {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: ItemPrice,
    public readonly status: ItemStatus,
    public readonly sellerId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  public static create(
    id: string,
    name: string,
    description: string,
    price: ItemPrice,
    sellerId: string,
  ): Item {
    if (!Item.isValidName(name)) {
      throw new Error("商品名は1文字以上20文字以下でなければなりません");
    }
    if (!Item.isValidDescription(description)) {
      throw new Error("商品説明は1文字以上1000文字以下でなければなりません");
    }
    return new Item(
      id,
      name,
      description,
      price,
      ItemStatus.create(ItemStatusMap.SELLABLE),
      sellerId,
      new Date(),
      new Date(),
    );
  }

  /**
   * DBモデルから復元する
   */
  public static reconstitute(
    id: string,
    name: string,
    description: string,
    price: ItemPrice,
    status: ItemStatus,
    sellerId: string,
    createdAt: Date,
    updatedAt: Date,
  ): Item {
    return new Item(
      id,
      name,
      description,
      price,
      status,
      sellerId,
      createdAt,
      updatedAt,
    );
  }

  /**
   * 商品の名前が有効かどうかを返す
   * @param name 商品の名前
   * @returns 商品の名前が有効かどうか
   */
  private static isValidName(name: string): boolean {
    return name.length >= 1 && name.length <= 20;
  }

  /**
   * 商品の詳細が有効かどうかを返す
   * @param description 商品の詳細
   * @returns 商品の詳細が有効かどうか
   */
  private static isValidDescription(description: string): boolean {
    return description.length >= 1 && description.length <= 1000;
  }

  /**
   * 商品が購入済みかどうかを返す
   * @returns 商品が購入済みかどうか
   */
  public isPurchased(): boolean {
    return this.status.isPurchased();
  }

  /**
   * 商品が出品中かどうかを返す
   * @returns 商品が出品中かどうか
   */
  public isSellable(): boolean {
    return this.status.isSellable();
  }

  /**
   * 出品者はその商品を購入することはできない
   */
  public isPurchasableByUser(userId: string): boolean {
    return this.sellerId !== userId;
  }

  /**
   * 商品の出品状態を変更する
   *
   * @param status 0: 出品中, 1: 購入済
   * @returns
   */
  public changeStatus(status: ItemStatus): Item {
    return new Item(
      this.id,
      this.name,
      this.description,
      this.price,
      status,
      this.sellerId,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * 商品の名前を変更する
   * @param name 商品の名前
   * @returns 商品
   */
  public changeName(name: string): Item {
    if (!Item.isValidName(name)) {
      throw new Error("商品名は1文字以上20文字以下でなければなりません");
    }
    return new Item(
      this.id,
      name,
      this.description,
      this.price,
      this.status,
      this.sellerId,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * 商品の詳細を変更する
   * @param description 商品の詳細
   * @returns 商品
   */
  public changeDescription(description: string): Item {
    if (!Item.isValidDescription(description)) {
      throw new Error("商品説明は1文字以上1000文字以下でなければなりません");
    }
    return new Item(
      this.id,
      this.name,
      description,
      this.price,
      this.status,
      this.sellerId,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * 商品の価格を変更する
   * @param price 商品の価格
   * @returns 商品
   */
  public changePrice(price: ItemPrice): Item {
    return new Item(
      this.id,
      this.name,
      this.description,
      price,
      this.status,
      this.sellerId,
      this.createdAt,
      new Date(),
    );
  }
}
