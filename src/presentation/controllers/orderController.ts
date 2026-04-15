import type { Context } from "hono";
import { createTransactionManager } from "../../infrastructure/database/transactionManager.js";
import { createItemRepository } from "../../infrastructure/repository/itemRepository.js";
import { createOrderHistoryRepository } from "../../infrastructure/repository/orderHistoryRepository.js";
import { createOrderRepository } from "../../infrastructure/repository/orderRepository.js";
import { cancelOrder } from "../../usecase/command/cancelOrder.js";
import { deliverOrder } from "../../usecase/command/deliverOrder.js";
import { purchaseOrder } from "../../usecase/command/purchaseOrder.js";
import { shipOrder } from "../../usecase/command/shipOrder.js";
import { getOrderDetail } from "../../usecase/query/getOrderDetail.js";
import type { DbVariables } from "../middleware/dbMiddleware.js";

export const orderController = {
  /**
   * 商品を購入する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  purchase: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const txManager = createTransactionManager(db);
    const body = await c.req.json<{ userId: string; itemId: string }>();
    const result = await purchaseOrder(
      {
        txManager,
        createItemRepository,
        createOrderRepository,
        createOrderHistoryRepository,
      },
      { userId: body.userId, itemId: body.itemId },
    );
    return c.json(result, 201);
  },

  /**
   * 注文をキャンセルする
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  cancel: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const txManager = createTransactionManager(db);
    const orderId = c.req.param("orderId")!;
    const result = await cancelOrder(
      {
        txManager,
        createItemRepository,
        createOrderRepository,
        createOrderHistoryRepository,
      },
      { orderId },
    );
    return c.json(result);
  },

  /**
   * 注文を配達完了にする
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  deliver: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const txManager = createTransactionManager(db);
    const orderId = c.req.param("orderId")!;
    const result = await deliverOrder(
      { txManager, createOrderRepository, createOrderHistoryRepository },
      { orderId },
    );
    return c.json(result);
  },

  /**
   * 注文を発送する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  ship: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const txManager = createTransactionManager(db);
    const orderId = c.req.param("orderId")!;
    const result = await shipOrder(
      { txManager, createOrderRepository, createOrderHistoryRepository },
      { orderId },
    );
    return c.json(result);
  },

  /**
   * 注文を取得する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  getById: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const orderId = c.req.param("orderId")!;
    const result = await getOrderDetail(
      { db, createOrderRepository, createOrderHistoryRepository },
      { orderId },
    );
    return c.json(result);
  },
} as const;
