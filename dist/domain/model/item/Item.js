import { ItemStatus, ItemStatusMap } from "./ItemStatus.js";
export class Item {
    id;
    name;
    description;
    price;
    status;
    sellerId;
    createdAt;
    updatedAt;
    constructor(id, name, description, price, status, sellerId, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.status = status;
        this.sellerId = sellerId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(id, name, description, price, sellerId) {
        if (!Item.isValidName(name)) {
            throw new Error("商品名は1文字以上20文字以下でなければなりません");
        }
        if (!Item.isValidDescription(description)) {
            throw new Error("商品説明は1文字以上1000文字以下でなければなりません");
        }
        return new Item(id, name, description, price, ItemStatus.create(ItemStatusMap.SELLABLE), sellerId, new Date(), new Date());
    }
    /**
     * DBモデルから復元する
     */
    static reconstitute(id, name, description, price, status, sellerId, createdAt, updatedAt) {
        return new Item(id, name, description, price, status, sellerId, createdAt, updatedAt);
    }
    /**
     * 商品の名前が有効かどうかを返す
     * @param name 商品の名前
     * @returns 商品の名前が有効かどうか
     */
    static isValidName(name) {
        return name.length >= 1 && name.length <= 20;
    }
    /**
     * 商品の詳細が有効かどうかを返す
     * @param description 商品の詳細
     * @returns 商品の詳細が有効かどうか
     */
    static isValidDescription(description) {
        return description.length >= 1 && description.length <= 1000;
    }
    /**
     * 商品が購入済みかどうかを返す
     * @returns 商品が購入済みかどうか
     */
    isPurchased() {
        return this.status.isPurchased();
    }
    /**
     * 商品が出品中かどうかを返す
     * @returns 商品が出品中かどうか
     */
    isSellable() {
        return this.status.isSellable();
    }
    /**
     * 出品者はその商品を購入することはできない
     */
    isPurchasableByUser(userId) {
        return this.sellerId !== userId;
    }
    /**
     * 商品の出品状態を変更する
     *
     * @param status 0: 出品中, 1: 購入済
     * @returns
     */
    changeStatus(status) {
        return new Item(this.id, this.name, this.description, this.price, status, this.sellerId, this.createdAt, new Date());
    }
    /**
     * 商品の名前を変更する
     * @param name 商品の名前
     * @returns 商品
     */
    changeName(name) {
        if (!Item.isValidName(name)) {
            throw new Error("商品名は1文字以上20文字以下でなければなりません");
        }
        return new Item(this.id, name, this.description, this.price, this.status, this.sellerId, this.createdAt, new Date());
    }
    /**
     * 商品の詳細を変更する
     * @param description 商品の詳細
     * @returns 商品
     */
    changeDescription(description) {
        if (!Item.isValidDescription(description)) {
            throw new Error("商品説明は1文字以上1000文字以下でなければなりません");
        }
        return new Item(this.id, this.name, description, this.price, this.status, this.sellerId, this.createdAt, new Date());
    }
    /**
     * 商品の価格を変更する
     * @param price 商品の価格
     * @returns 商品
     */
    changePrice(price) {
        return new Item(this.id, this.name, this.description, price, this.status, this.sellerId, this.createdAt, new Date());
    }
}
