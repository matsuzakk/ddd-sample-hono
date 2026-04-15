import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  dbMiddleware,
  type DbVariables,
} from "./presentation/middleware/dbMiddleware.js";
import { itemsRoute } from "./presentation/routes/items.js";
import { ordersRoute } from "./presentation/routes/orders.js";
import { usersRoute } from "./presentation/routes/users.js";

const app = new Hono<{ Variables: DbVariables }>();

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  if (err instanceof Error) {
    return c.json({ message: err.message }, 400);
  }
  console.error(err);
  return c.json({ message: "Internal Server Error" }, 500);
});

app.use("*", dbMiddleware);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/users", usersRoute);
app.route("/items", itemsRoute);
app.route("/orders", ordersRoute);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
