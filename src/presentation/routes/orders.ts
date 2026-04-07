import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { createItemRepository } from "../../infrastructure/database/itemRepository.js";
import { createOrderHistoryRepository } from "../../infrastructure/database/orderHistoryRepository.js";
import { createOrderRepository } from "../../infrastructure/database/orderRepository.js";
import { purchaseItem } from "../../usecase/command/itemPurchase.js";
import { orderCancel } from "../../usecase/command/orderCancel.js";
import { orderDelivered } from "../../usecase/command/orderDelivered.js";
import { orderShip } from "../../usecase/command/orderShip.js";
import { orderDetail } from "../../usecase/query/orderDetail.js";
import type { DbVariables } from "../middleware/dbMiddleware.js";

export const ordersRoute = new Hono<{ Variables: DbVariables }>();

ordersRoute.post("/", async (c) => {
  const db = c.get("db");
  const body = await c.req.json<{ userId: string; itemId: string }>();
  try {
    const result = await purchaseItem(
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
    const msg = String(e);
    if (msg.includes("not found")) {
      throw new HTTPException(404, { message: msg });
    }
    throw new HTTPException(400, { message: msg });
  }
});

ordersRoute.put("/:orderId/cancel", async (c) => {
  const db = c.get("db");
  const orderId = c.req.param("orderId");
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
    const msg = String(e);
    if (msg.includes("not found")) {
      throw new HTTPException(404, { message: msg });
    }
    throw new HTTPException(400, { message: msg });
  }
});

ordersRoute.put("/:orderId/deliver", async (c) => {
  const db = c.get("db");
  const orderId = c.req.param("orderId");
  try {
    const result = await orderDelivered(
      { db, createOrderRepository, createOrderHistoryRepository },
      { orderId },
    );
    return c.json(result);
  } catch (e) {
    const msg = String(e);
    if (msg.includes("not found")) {
      throw new HTTPException(404, { message: msg });
    }
    throw new HTTPException(400, { message: msg });
  }
});

ordersRoute.put("/:orderId/ship", async (c) => {
  const db = c.get("db");
  const orderId = c.req.param("orderId");
  try {
    const result = await orderShip(
      { db, createOrderRepository, createOrderHistoryRepository },
      { orderId },
    );
    return c.json(result);
  } catch (e) {
    const msg = String(e);
    if (msg.includes("not found")) {
      throw new HTTPException(404, { message: msg });
    }
    throw new HTTPException(400, { message: msg });
  }
});

ordersRoute.get("/:orderId", async (c) => {
  const db = c.get("db");
  const orderId = c.req.param("orderId");
  const result = await orderDetail(
    { db, createOrderRepository, createOrderHistoryRepository },
    { orderId },
  );
  if (!result.order) {
    throw new HTTPException(404, { message: "Order not found" });
  }
  return c.json(result);
});
