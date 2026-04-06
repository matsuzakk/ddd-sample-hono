/**
 * 商品の価格
 *
 * 0円以上999,999円以下の整数
 */
export class ItemPrice {
    price;
    constructor(price) {
        this.price = price;
    }
    static create(price) {
        if (price < 0 || price > 999999) {
            throw new Error("商品の価格は0円以上999,999円以下の整数でなければなりません");
        }
        return new ItemPrice(price);
    }
    /**
     * DBモデルから復元する
     */
    static reconstitute(value) {
        return new ItemPrice(value);
    }
    toValue() {
        return this.price;
    }
}
