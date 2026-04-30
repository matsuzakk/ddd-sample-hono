import type { Context } from "hono";
import { createTransactionManager } from "../../infrastructure/database/transactionManager.js";
import { createItemRepository } from "../../infrastructure/repository/itemRepository.js";
import { createOrderHistoryRepository } from "../../infrastructure/repository/orderHistoryRepository.js";
import { createOrderRepository } from "../../infrastructure/repository/orderRepository.js";
import { cancelOrderUsecase } from "../../usecase/command/cancelOrderUsecase.js";
import { deliverOrderUsecase } from "../../usecase/command/deliverOrderUsecase.js";
import { purchaseItemUsecase } from "../../usecase/command/purchaseItemUsecase.js";
import { shipOrderUsecase } from "../../usecase/command/shipOrderUsecase.js";
import { getOrderDetailUsecase } from "../../usecase/query/getOrderDetailUsecase.js";
import type { AppVariables } from "../../env.js";

export const orderController = {
  // Command

  /**
   * 商品を購入する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  purchase: async (c: Context<{ Variables: AppVariables }>) => {
    const db = c.get("db");
    const txManager = createTransactionManager(db);
    const userId = c.get("sessionUserId") as string;

    const body = await c.req.json<{ itemId: string }>();
    const result = await purchaseItemUsecase(
      {
        txManager,
        createItemRepository,
        createOrderRepository,
        createOrderHistoryRepository,
      },
      { userId, itemId: body.itemId },
    );
    return c.json(result, 201);
  },

  /**
   * 注文をキャンセルする
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  cancel: async (c: Context<{ Variables: AppVariables }>) => {
    const db = c.get("db");
    const txManager = createTransactionManager(db);
    const userId = c.get("sessionUserId") as string;
    const orderId = c.req.param("orderId")!;

    const result = await cancelOrderUsecase(
      {
        txManager,
        createItemRepository,
        createOrderRepository,
        createOrderHistoryRepository,
      },
      { userId, orderId },
    );
    return c.json(result);
  },

  /**
   * 注文を配達完了にする
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  deliver: async (c: Context<{ Variables: AppVariables }>) => {
    const db = c.get("db");
    const txManager = createTransactionManager(db);
    const orderId = c.req.param("orderId")!;
    const result = await deliverOrderUsecase(
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
  ship: async (c: Context<{ Variables: AppVariables }>) => {
    const db = c.get("db");
    const txManager = createTransactionManager(db);
    const orderId = c.req.param("orderId")!;
    const result = await shipOrderUsecase(
      { txManager, createOrderRepository, createOrderHistoryRepository },
      { orderId },
    );
    return c.json(result);
  },

  // Query

  /**
   * 注文を取得する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  getById: async (c: Context<{ Variables: AppVariables }>) => {
    const db = c.get("db");
    const orderId = c.req.param("orderId")!;
    const result = await getOrderDetailUsecase({ db }, { orderId });
    return c.json(result);
  },
} as const;
