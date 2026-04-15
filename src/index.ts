import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { DomainError } from "./domain/model/shared/error.js";
import {
  dbMiddleware,
  type DbVariables,
} from "./presentation/middleware/dbMiddleware.js";
import { itemsRoute } from "./presentation/routes/items.js";
import { ordersRoute } from "./presentation/routes/orders.js";
import { usersRoute } from "./presentation/routes/users.js";

const app = new Hono<{ Variables: DbVariables }>();

app.onError((err, c) => {
  console.error(err);

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  if (err instanceof DomainError) {
    return c.json(
      {
        code: err.code,
        message: err.message,
        description: err.description,
      },
      err.statusCode as ContentfulStatusCode,
    );
  }

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
