import { Hono } from "hono";
import { orderController } from "../controllers/orderController.js";
import type { AppVariables } from "../../env.js";

export const ordersRoute = new Hono<{ Variables: AppVariables }>();

ordersRoute.post("/", orderController.purchase);
ordersRoute.put("/:orderId/cancel", orderController.cancel);
ordersRoute.put("/:orderId/deliver", orderController.deliver);
ordersRoute.put("/:orderId/ship", orderController.ship);
ordersRoute.get("/:orderId", orderController.getById);
