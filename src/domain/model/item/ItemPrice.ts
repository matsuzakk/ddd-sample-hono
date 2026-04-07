/**
 * 商品の価格
 *
 * 0円以上999,999円以下の整数
 */
export class ItemPrice {
  private constructor(public readonly price: number) {}

  public static create(price: number): ItemPrice {
    if (!this.isValid(price)) {
      throw new Error(
        "商品の価格は0円以上999,999円以下の整数でなければなりません",
      );
    }
    return new ItemPrice(price);
  }

  /**
   * DBモデルから復元する
   */
  public static reconstitute(value: number): ItemPrice {
    if (!this.isValid(value)) {
      throw new Error(
        "商品の価格は0円以上999,999円以下の整数でなければなりません",
      );
    }
    return new ItemPrice(value);
  }

  public static isValid(price: number): boolean {
    return price >= 0 && price <= 999999;
  }

  public toValue(): number {
    return this.price;
  }
}
