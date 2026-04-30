import type { Context } from "hono";
import { getItemSellListUsecase } from "../../usecase/query/getItemSellListUsecase.js";
import { getOrderListUsecase } from "../../usecase/query/getOrderListUsecase.js";
import type { AppVariables } from "../../env.js";

export const userController = {
  // Query

  /**
   * ユーザーが出品した商品一覧を取得する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  listSellItems: async (c: Context<{ Variables: AppVariables }>) => {
    const db = c.get("db");
    const userId = c.get("sessionUserId") as string;

    const result = await getItemSellListUsecase({ db }, { sellerId: userId });
    return c.json(result);
  },

  /**
   * ユーザーの注文履歴を取得する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  listOrders: async (c: Context<{ Variables: AppVariables }>) => {
    const db = c.get("db");
    const userId = c.get("sessionUserId") as string;

    const result = await getOrderListUsecase({ db }, { userId });
    return c.json(result);
  },
} as const;
