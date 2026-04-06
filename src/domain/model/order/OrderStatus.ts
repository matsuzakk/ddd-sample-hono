export const OrderStatusMap = {
  PURCHASED: 0,
  SHIPPED: 1,
  DELIVERED: 2,
  CANCELED: 3,
} as const;
export type OrderStatusType =
  (typeof OrderStatusMap)[keyof typeof OrderStatusMap];

export class OrderStatus {
  private constructor(public readonly status: OrderStatusType) {}

  /**
   *
   * @param status 0: 購入済,　1: 発送済, 2: 到着済, 3: キャンセル
   * @returns
   */
  public static create(status: OrderStatusType): OrderStatus {
    return new OrderStatus(status);
  }

  /** DB 等の保存値（整数）から復元する */
  public static reconstitute(value: number): OrderStatus {
    if (
      value !== OrderStatusMap.PURCHASED &&
      value !== OrderStatusMap.SHIPPED &&
      value !== OrderStatusMap.DELIVERED &&
      value !== OrderStatusMap.CANCELED
    ) {
      throw new Error(`Invalid order status: ${value}`);
    }
    return new OrderStatus(value);
  }

  /**
   * 注文の状態を数値に変換する
   * @returns 注文の状態を数値に変換する
   */
  public toValue(): number {
    return this.status;
  }

  /**
   * 注文が購入済みかどうかを返す
   * @returns 注文が購入済みかどうか
   */
  public isPurchased(): boolean {
    return this.status === OrderStatusMap.PURCHASED;
  }

  /**
   * 注文が発送済みかどうかを返す
   * @returns 注文が発送済みかどうか
   */
  public isShipped(): boolean {
    return this.status === OrderStatusMap.SHIPPED;
  }

  /**
   * 注文が到着済みかどうかを返す
   * @returns 注文が到着済みかどうか
   */
  public isDelivered(): boolean {
    return this.status === OrderStatusMap.DELIVERED;
  }

  /**
   * 注文がキャンセルされているかどうかを返す
   * @returns 注文がキャンセルされているかどうか
   */
  public isCanceled(): boolean {
    return this.status === OrderStatusMap.CANCELED;
  }
}
