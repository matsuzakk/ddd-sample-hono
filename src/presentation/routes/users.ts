import { Hono } from "hono";
import { userController } from "../controllers/userController.js";
import type { DbVariables } from "../middleware/dbMiddleware.js";

export const usersRoute = new Hono<{ Variables: DbVariables }>();

usersRoute.post("/", userController.register);
usersRoute.get("/:userId/items", userController.listSellerItems);
usersRoute.get("/:userId/orders", userController.listOrders);
