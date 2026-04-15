import { Hono } from "hono";
import { itemController } from "../controllers/itemController.js";
import type { DbVariables } from "../middleware/dbMiddleware.js";

export const itemsRoute = new Hono<{ Variables: DbVariables }>();

itemsRoute.post("/", itemController.sell);
itemsRoute.get("/", itemController.list);
itemsRoute.get("/:itemId", itemController.getById);
