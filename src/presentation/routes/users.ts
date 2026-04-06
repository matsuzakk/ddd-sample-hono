import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { createItemRepository } from "../../infrastructure/database/itemRepository.js";
import { createOrderRepository } from "../../infrastructure/database/orderRepository.js";
import { createUserRepository } from "../../infrastructure/database/userRepository.js";
import { registerUser } from "../../usecase/command/userRegister.js";
import { itemSellList } from "../../usecase/query/itemSellList.js";
import { orderList } from "../../usecase/query/orderList.js";
import type { DbVariables } from "../middleware/dbMiddleware.js";

export const usersRoute = new Hono<{ Variables: DbVariables }>();

usersRoute.post("/", async (c) => {
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
});

usersRoute.get("/:userId/items", async (c) => {
  const db = c.get("db");
  const userId = c.req.param("userId");
  const result = await itemSellList(
    { db, createItemRepository },
    { sellerId: userId },
  );
  return c.json(result);
});

usersRoute.get("/:userId/orders", async (c) => {
  const db = c.get("db");
  const userId = c.req.param("userId");
  const result = await orderList(
    { db, createOrderRepository },
    { userId },
  );
  return c.json(result);
});
