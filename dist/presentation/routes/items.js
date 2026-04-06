import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { createItemRepository } from "../../infrastructure/database/itemRepository.js";
import { itemSell } from "../../usecase/command/itemSell.js";
import { itemDetail } from "../../usecase/query/itemDetail.js";
import { itemGetAllList } from "../../usecase/query/itemGetAllList.js";
export const itemsRoute = new Hono();
itemsRoute.post("/", async (c) => {
    const db = c.get("db");
    const body = await c.req.json();
    try {
        const result = await itemSell({ db, createItemRepository }, {
            sellerId: body.sellerId,
            name: body.name,
            description: body.description,
            price: body.price,
        });
        return c.json(result, 201);
    }
    catch (e) {
        throw new HTTPException(400, { message: String(e) });
    }
});
itemsRoute.get("/", async (c) => {
    const db = c.get("db");
    const result = await itemGetAllList({ db, createItemRepository });
    return c.json(result);
});
itemsRoute.get("/:itemId", async (c) => {
    const db = c.get("db");
    const itemId = c.req.param("itemId");
    const result = await itemDetail({ db, createItemRepository }, { itemId });
    if (!result) {
        throw new HTTPException(404, { message: "Item not found" });
    }
    return c.json(result);
});
