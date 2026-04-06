export const OrderStatusMap = {
    PURCHASED: 0,
    SHIPPED: 1,
    DELIVERED: 2,
    CANCELED: 3,
};
export class OrderStatus {
    status;
    constructor(status) {
        this.status = status;
    }
    /**
     *
     * @param status 0: 購入済,　1: 発送済, 2: 到着済, 3: キャンセル
     * @returns
     */
    static create(status) {
        return new OrderStatus(status);
    }
    /** DB 等の保存値（整数）から復元する */
    static reconstitute(value) {
        if (value !== OrderStatusMap.PURCHASED &&
            value !== OrderStatusMap.SHIPPED &&
            value !== OrderStatusMap.DELIVERED &&
            value !== OrderStatusMap.CANCELED) {
            throw new Error(`Invalid order status: ${value}`);
        }
        return new OrderStatus(value);
    }
    /**
     * 注文の状態を数値に変換する
     * @returns 注文の状態を数値に変換する
     */
    toValue() {
        return this.status;
    }
    /**
     * 注文が購入済みかどうかを返す
     * @returns 注文が購入済みかどうか
     */
    isPurchased() {
        return this.status === OrderStatusMap.PURCHASED;
    }
    /**
     * 注文が発送済みかどうかを返す
     * @returns 注文が発送済みかどうか
     */
    isShipped() {
        return this.status === OrderStatusMap.SHIPPED;
    }
    /**
     * 注文が到着済みかどうかを返す
     * @returns 注文が到着済みかどうか
     */
    isDelivered() {
        return this.status === OrderStatusMap.DELIVERED;
    }
    /**
     * 注文がキャンセルされているかどうかを返す
     * @returns 注文がキャンセルされているかどうか
     */
    isCanceled() {
        return this.status === OrderStatusMap.CANCELED;
    }
}
