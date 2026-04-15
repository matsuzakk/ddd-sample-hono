import type { Context } from "hono";
import { createItemRepository } from "../../infrastructure/repository/itemRepository.js";
import { sellItem } from "../../usecase/command/sellItem.js";
import { getItemAllList } from "../../usecase/query/getItemAllList.js";
import { getItemDetail } from "../../usecase/query/getItemDetail.js";
import type { DbVariables } from "../middleware/dbMiddleware.js";

export const itemController = {
  /**
   * 商品を出品する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  sell: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const body = await c.req.json<{
      sellerId: string;
      name: string;
      description: string;
      price: number;
    }>();
    const result = await sellItem(
      { db, createItemRepository },
      {
        sellerId: body.sellerId,
        name: body.name,
        description: body.description,
        price: body.price,
      },
    );
    return c.json(result, 201);
  },

  /**
   * 商品一覧を取得する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  list: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const result = await getItemAllList({ db, createItemRepository });
    return c.json(result);
  },

  /**
   * 商品を取得する
   * @param c - Hono context
   * @returns - Promise<Response>
   */
  getById: async (c: Context<{ Variables: DbVariables }>) => {
    const db = c.get("db");
    const itemId = c.req.param("itemId")!;
    const result = await getItemDetail({ db, createItemRepository }, { itemId });
    return c.json(result);
  },
} as const;
