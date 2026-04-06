import type { Item } from "../item/Item.js";
import type { OrderHistory } from "./OrderHistory.js";
import { OrderStatus, OrderStatusMap } from "./OrderStatus.js";

export class Order {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly itemId: string,
    public readonly status: OrderStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  public static create(id: string, userId: string, item: Item): Order {
    if (!item.isPurchasableByUser(userId)) {
      throw new Error("出品者はその商品を購入することはできません");
    }

    if (item.isPurchased()) {
      throw new Error("商品はすでに購入されているため注文できません");
    }

    return new Order(
      id,
      userId,
      item.id,
      OrderStatus.create(OrderStatusMap.PURCHASED),
      new Date(),
      new Date(),
    );
  }

  /**
   * DBモデルから復元する
   */
  public static reconstitute(
    id: string,
    userId: string,
    itemId: string,
    status: OrderStatus,
    createdAt: Date,
    updatedAt: Date,
  ): Order {
    return new Order(id, userId, itemId, status, createdAt, updatedAt);
  }

  /**
   * 注文の状態を変更する
   * @param status 注文の状態
   * @returns 注文
   */
  public changeStatus(status: OrderStatus): Order {
    return new Order(
      this.id,
      this.userId,
      this.itemId,
      status,
      this.createdAt,
      new Date(),
    );
  }
}
