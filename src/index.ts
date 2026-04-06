import { serve } from "@hono/node-server";
import { Hono } from "hono";
import {
  dbMiddleware,
  type DbVariables,
} from "./presentation/middleware/dbMiddleware.js";

const app = new Hono<{ Variables: DbVariables }>();

app.use("*", dbMiddleware);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
