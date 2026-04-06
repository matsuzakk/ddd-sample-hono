import { OrderStatus, OrderStatusMap } from "./OrderStatus.js";
export class Order {
    id;
    userId;
    itemId;
    status;
    createdAt;
    updatedAt;
    constructor(id, userId, itemId, status, createdAt, updatedAt) {
        this.id = id;
        this.userId = userId;
        this.itemId = itemId;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(id, userId, item) {
        if (!item.isPurchasableByUser(userId)) {
            throw new Error("出品者はその商品を購入することはできません");
        }
        if (item.isPurchased()) {
            throw new Error("商品はすでに購入されているため注文できません");
        }
        return new Order(id, userId, item.id, OrderStatus.create(OrderStatusMap.PURCHASED), new Date(), new Date());
    }
    /**
     * DBモデルから復元する
     */
    static reconstitute(id, userId, itemId, status, createdAt, updatedAt) {
        return new Order(id, userId, itemId, status, createdAt, updatedAt);
    }
    /**
     * 注文の状態を変更する
     * @param status 注文の状態
     * @returns 注文
     */
    changeStatus(status) {
        return new Order(this.id, this.userId, this.itemId, status, this.createdAt, new Date());
    }
}
