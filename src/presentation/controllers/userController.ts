import type { Context } from "hono";
import { getItemSellList } from "../../usecase/query/getItemSellList.js";
import { getOrderList } from "../../usecase/query/getOrderList.js";
import type { DbVariables } from "../middleware/dbMiddleware.js";

export const userController = {
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
