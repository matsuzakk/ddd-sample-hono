import type { Context } from "hono";
import { createUserRepository } from "../../infrastructure/repository/userRepository.js";
import { registerUser } from "../../usecase/command/registerUser.js";
import { getItemSellList } from "../../usecase/query/getItemSellList.js";
import { getOrderList } from "../../usecase/query/getOrderList.js";
import type { DbVariables } from "../middleware/dbMiddleware.js";

export const userController = {
  // Command

  /**
   * ユーザーを登録する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  register: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const body = await c.req.json<{ name: string; email: string }>();
    const result = await registerUser(
      { db, createUserRepository },
      { name: body.name, email: body.email },
    );
    return c.json(result, 201);
  },

  // Query

  /**
   * ユーザーが出品した商品一覧を取得する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  listSellerItems: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const userId = c.req.param("userId")!;
    const result = await getItemSellList({ db }, { sellerId: userId });
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
    const result = await getOrderList({ db }, { userId });
    return c.json(result);
  },
} as const;
