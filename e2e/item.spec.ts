import { describe, expect, test } from "vitest";
import { ItemStatusMap } from "../src/domain/model/item/ItemStatus.js";
import { createE2eApp, seedData, signUpEmailViaHttp } from "./config/setup.js";
import { MOCK_ITEM } from "./mock/item.js";
import { MOCK_USER, MOCK_USER_PASSWORD } from "./mock/user.js";

describe("POST /items", () => {
  test("出品リクエストで商品が作成され出品中で返る(201)", async () => {
    const { app, close } = createE2eApp();
    try {
      const seller = await signUpEmailViaHttp(app, {
        name: MOCK_USER.SELLER.name,
        email: MOCK_USER.SELLER.email,
        password: MOCK_USER_PASSWORD,
      });

      const res = await app.request("/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-e2e-user-id": seller.id,
        },
        body: JSON.stringify({
          ...MOCK_ITEM.SAMPLE,
          sellerId: seller.id,
        }),
      });

      expect(res.status).toBe(201);
      const body = (await res.json()) as {
        name: string;
        price: number;
        status: number;
        sellerId: number;
      };
      expect(body.name).toBe(MOCK_ITEM.SAMPLE.name);
      expect(body.price).toBe(MOCK_ITEM.SAMPLE.price);
      expect(body.status).toBe(ItemStatusMap.SELLABLE);
      expect(body.sellerId).toBe(seller.id);
    } finally {
      close();
    }
  });

  test("価格が範囲外だとENTITY_VALIDATION_ERRORが返る(400)", async () => {
    const { app, close } = createE2eApp();
    try {
      const seller = await signUpEmailViaHttp(app, {
        name: MOCK_USER.SELLER.name,
        email: MOCK_USER.SELLER.email,
        password: MOCK_USER_PASSWORD,
      });

      const res = await app.request("/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-e2e-user-id": seller.id,
        },
        body: JSON.stringify({
          name: MOCK_ITEM.SAMPLE.name,
          description: MOCK_ITEM.SAMPLE.description,
          price: -1,
          sellerId: seller.id,
        }),
      });

      expect(res.status).toBe(400);
      const body = (await res.json()) as { code?: string };
      expect(body.code).toBe("ENTITY_VALIDATION_ERROR");
    } finally {
      close();
    }
  });
});

describe("GET /items", () => {
  test("商品が無いとき空配列が返る(200)", async () => {
    const { app, close } = createE2eApp();
    try {
      const res = await app.request("/items", { method: "GET" });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    } finally {
      close();
    }
  });

  test("シード後の一覧に出品した商品が含まれる(200)", async () => {
    const { app, close } = createE2eApp();
    try {
      const { item } = await seedData(app);

      const res = await app.request("/items", { method: "GET" });

      expect(res.status).toBe(200);
      const list = (await res.json()) as { id: number }[];
      expect(list.some((row) => row.id === item.id)).toBe(true);
    } finally {
      close();
    }
  });
});

describe("GET /items/:itemId", () => {
  test("存在する商品IDで詳細が取得できる(200)", async () => {
    const { app, close } = createE2eApp();
    try {
      const { item } = await seedData(app);

      const res = await app.request(`/items/${item.id}`, { method: "GET" });

      expect(res.status).toBe(200);
      const body = (await res.json()) as { id: number; name: string };
      expect(body.id).toBe(item.id);
      expect(body.name).toBe(MOCK_ITEM.SAMPLE.name);
    } finally {
      close();
    }
  });

  test("存在しない商品IDではNOT_FOUND_ENTITYが返る(404)", async () => {
    const { app, close } = createE2eApp();
    try {
      const res = await app.request("/items/999999999", {
        method: "GET",
      });

      expect(res.status).toBe(404);
      const body = (await res.json()) as { code?: string };
      expect(body.code).toBe("NOT_FOUND_ENTITY");
    } finally {
      close();
    }
  });
});
