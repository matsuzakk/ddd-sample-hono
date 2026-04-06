export const ItemStatusMap = {
  SELLABLE: 0,
  PURCHASED: 1,
} as const;
type ItemStatusType = (typeof ItemStatusMap)[keyof typeof ItemStatusMap];
/**
 * 商品の状態
 *
 * 0: 出品中
 * 1: 購入済
 */
export class ItemStatus {
  private constructor(public readonly status: ItemStatusType) {}

  public static create(status: ItemStatusType): ItemStatus {
    return new ItemStatus(status);
  }

  /**
   * DBモデルから復元する
   */
  public static reconstitute(value: number): ItemStatus {
    if (value !== ItemStatusMap.SELLABLE && value !== ItemStatusMap.PURCHASED) {
      throw new Error(`Invalid item status: ${value}`);
    }
    return new ItemStatus(value);
  }

  /**
   * 商品の状態を数値に変換する
   * @returns 商品の状態を数値に変換する
   */
  public toValue(): number {
    return this.status;
  }

  /**
   * 商品が購入済みかどうかを返す
   * @returns 商品が購入済みかどうか
   */
  public isPurchased(): boolean {
    return this.status === ItemStatusMap.PURCHASED;
  }

  /**
   * 商品が出品中かどうかを返す
   * @returns 商品が出品中かどうか
   */
  public isSellable(): boolean {
    return this.status === ItemStatusMap.SELLABLE;
  }
}
