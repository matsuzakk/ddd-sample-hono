import { Hono } from "hono";
import { itemController } from "../controllers/itemController.js";
import type { AppVariables } from "../../env.js";

export const itemsRoute = new Hono<{ Variables: AppVariables }>();

itemsRoute.post("/", itemController.sell);
itemsRoute.get("/", itemController.list);
itemsRoute.get("/:itemId", itemController.getById);
