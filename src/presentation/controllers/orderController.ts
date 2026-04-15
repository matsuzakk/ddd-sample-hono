import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { createItemRepository } from "../../infrastructure/repository/itemRepository.js";
import { createOrderHistoryRepository } from "../../infrastructure/repository/orderHistoryRepository.js";
import { createOrderRepository } from "../../infrastructure/repository/orderRepository.js";
import { orderPurchase } from "../../usecase/command/orderPurchase.js";
import { orderCancel } from "../../usecase/command/orderCancel.js";
import { orderDelivered } from "../../usecase/command/orderDelivered.js";
import { orderShip } from "../../usecase/command/orderShip.js";
import { orderDetail } from "../../usecase/query/orderDetail.js";
import type { DbVariables } from "../middleware/dbMiddleware.js";

function throwOrderHttp(e: unknown): never {
  const msg = String(e);
  if (msg.includes("not found")) {
    throw new HTTPException(404, { message: msg });
  }
  throw new HTTPException(400, { message: msg });
}

export const orderController = {
  /**
   * 商品を購入する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  purchase: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const body = await c.req.json<{ userId: string; itemId: string }>();
    try {
      const result = await orderPurchase(
        {
          db,
          createItemRepository,
          createOrderRepository,
          createOrderHistoryRepository,
        },
        { userId: body.userId, itemId: body.itemId },
      );
      return c.json(result, 201);
    } catch (e) {
      throwOrderHttp(e);
    }
  },

  /**
   * 注文をキャンセルする
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  cancel: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const orderId = c.req.param("orderId")!;
    try {
      const result = await orderCancel(
        {
          db,
          createItemRepository,
          createOrderRepository,
          createOrderHistoryRepository,
        },
        { orderId },
      );
      return c.json(result);
    } catch (e) {
      throwOrderHttp(e);
    }
  },

  /**
   * 注文を発送する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  deliver: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const orderId = c.req.param("orderId")!;
    try {
      const result = await orderDelivered(
        { db, createOrderRepository, createOrderHistoryRepository },
        { orderId },
      );
      return c.json(result);
    } catch (e) {
      throwOrderHttp(e);
    }
  },

  /**
   * 注文を発送する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  ship: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const orderId = c.req.param("orderId")!;
    try {
      const result = await orderShip(
        { db, createOrderRepository, createOrderHistoryRepository },
        { orderId },
      );
      return c.json(result);
    } catch (e) {
      throwOrderHttp(e);
    }
  },

  /**
   * 注文を取得する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  getById: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const orderId = c.req.param("orderId")!;
    const result = await orderDetail(
      { db, createOrderRepository, createOrderHistoryRepository },
      { orderId },
    );
    if (!result.order) {
      throw new HTTPException(404, { message: "Order not found" });
    }
    return c.json(result);
  },
} as const;
