import type { Item } from "../item/Item.js";
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
   * 注文ステータスを変更する
   */
  private withStatus(status: OrderStatus): Order {
    return new Order(
      this.id,
      this.userId,
      this.itemId,
      status,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * 購入済みの注文を発送済みにする（購入済以外は不可）
   */
  public markShipped(): Order {
    if (!this.status.isPurchased()) {
      throw new Error("Order cannot be shipped");
    }
    return this.withStatus(OrderStatus.create(OrderStatusMap.SHIPPED));
  }

  /**
   * 発送済みの注文を到着済みにする（発送済以外は不可）
   */
  public markDelivered(): Order {
    if (!this.status.isShipped()) {
      throw new Error("Order cannot be delivered");
    }
    return this.withStatus(OrderStatus.create(OrderStatusMap.DELIVERED));
  }

  /**
   * 購入直後の注文をキャンセルする（購入済以外は不可）
   */
  public cancel(): Order {
    if (!this.status.isPurchased()) {
      throw new Error("Order cannot be canceled");
    }
    return this.withStatus(OrderStatus.create(OrderStatusMap.CANCELED));
  }
}
