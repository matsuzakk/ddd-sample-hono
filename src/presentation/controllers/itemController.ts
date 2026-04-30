import type { Context } from "hono";
import { createItemRepository } from "../../infrastructure/repository/itemRepository.js";
import { createUserRepository } from "../../infrastructure/repository/userRepository.js";
import { sellItem } from "../../usecase/command/sellItem.js";
import { getItemAllList } from "../../usecase/query/getItemAllList.js";
import { getItemDetail } from "../../usecase/query/getItemDetail.js";
import type { AppVariables } from "../../env.js";

export const itemController = {
  // Command

  /**
   * 商品を出品する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  sell: async (c: Context<{ Variables: AppVariables }>) => {
    const db = c.get("db");
    const sellerId = c.get("sessionUserId") as string;

    const body = await c.req.json<{
      name: string;
      description: string;
      price: number;
    }>();
    const result = await sellItem(
      { db, createItemRepository, createUserRepository },
      {
        sellerId,
        name: body.name,
        description: body.description,
        price: body.price,
      },
    );
    return c.json(result, 201);
  },

  // Query

  /**
   * 商品一覧を取得する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  list: async (c: Context<{ Variables: AppVariables }>) => {
    const db = c.get("db");
    const result = await getItemAllList({ db });
    return c.json(result);
  },

  /**
   * 商品詳細を取得する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  getById: async (c: Context<{ Variables: AppVariables }>) => {
    const db = c.get("db");
    const itemId = c.req.param("itemId")!;
    const result = await getItemDetail({ db }, { itemId });
    return c.json(result);
  },
} as const;
