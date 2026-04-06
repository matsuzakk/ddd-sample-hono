export const ItemStatusMap = {
    SELLABLE: 0,
    PURCHASED: 1,
};
/**
 * 商品の状態
 *
 * 0: 出品中
 * 1: 購入済
 */
export class ItemStatus {
    status;
    constructor(status) {
        this.status = status;
    }
    static create(status) {
        return new ItemStatus(status);
    }
    /**
     * DBモデルから復元する
     */
    static reconstitute(value) {
        if (value !== ItemStatusMap.SELLABLE && value !== ItemStatusMap.PURCHASED) {
            throw new Error(`Invalid item status: ${value}`);
        }
        return new ItemStatus(value);
    }
    /**
     * 商品の状態を数値に変換する
     * @returns 商品の状態を数値に変換する
     */
    toValue() {
        return this.status;
    }
    /**
     * 商品が購入済みかどうかを返す
     * @returns 商品が購入済みかどうか
     */
    isPurchased() {
        return this.status === ItemStatusMap.PURCHASED;
    }
    /**
     * 商品が出品中かどうかを返す
     * @returns 商品が出品中かどうか
     */
    isSellable() {
        return this.status === ItemStatusMap.SELLABLE;
    }
}
