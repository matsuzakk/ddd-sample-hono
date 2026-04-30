import { Hono } from "hono";
import { userController } from "../controllers/userController.js";
import type { AppVariables } from "../../env.js";

export const usersRoute = new Hono<{ Variables: AppVariables }>();

usersRoute.get("/sellItems", userController.listSellItems);
usersRoute.get("/orders", userController.listOrders);
