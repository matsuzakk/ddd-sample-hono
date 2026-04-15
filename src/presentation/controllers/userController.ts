import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { createItemRepository } from "../../infrastructure/repository/itemRepository.js";
import { createOrderRepository } from "../../infrastructure/repository/orderRepository.js";
import { createUserRepository } from "../../infrastructure/repository/userRepository.js";
import { registerUser } from "../../usecase/command/userRegister.js";
import { itemSellList } from "../../usecase/query/itemSellList.js";
import { orderList } from "../../usecase/query/orderList.js";
import type { DbVariables } from "../middleware/dbMiddleware.js";

export const userController = {
  /**
   * ユーザーを登録する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  register: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const body = await c.req.json<{ name: string; email: string }>();
    try {
      const result = await registerUser(
        { db, createUserRepository },
        { name: body.name, email: body.email },
      );
      return c.json(result, 201);
    } catch (e) {
      throw new HTTPException(400, { message: String(e) });
    }
  },

  /**
   * ユーザーが出品した商品一覧を取得する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  listSellerItems: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const userId = c.req.param("userId")!;
    const result = await itemSellList(
      { db, createItemRepository },
      { sellerId: userId },
    );
    return c.json(result);
  },

  /**
   * ユーザーの注文履歴を取得する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  listOrders: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const userId = c.req.param("userId")!;
    const result = await orderList({ db, createOrderRepository }, { userId });
    return c.json(result);
  },
} as const;
