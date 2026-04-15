import type { Context } from "hono";
import { createItemRepository } from "../../infrastructure/repository/itemRepository.js";
import { itemSell } from "../../usecase/command/itemSell.js";
import { itemDetail } from "../../usecase/query/itemDetail.js";
import { itemGetAllList } from "../../usecase/query/itemGetAllList.js";
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
    const result = await itemSell(
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
    const result = await itemGetAllList({ db, createItemRepository });
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
    const result = await itemDetail({ db, createItemRepository }, { itemId });
    return c.json(result);
  },
} as const;
