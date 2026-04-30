import { describe, expect, test } from "vitest";
import { OrderStatusMap } from "../src/domain/model/order/OrderStatus.js";
import { createE2eApp, seedData, signUpEmailViaHttp } from "./config/setup.js";
import { MOCK_USER_PASSWORD } from "./mock/user.js";

describe("GET /users/items", () => {
  test("出品者の出品一覧にシードした商品が含まれる(200)", async () => {
    const { app, close } = createE2eApp();
    try {
      const { seller, item } = await seedData(app);

      const res = await app.request("/users/sellItems", {
        method: "GET",
        headers: { "x-e2e-user-id": seller.id },
      });

      expect(res.status).toBe(200);
      const list = (await res.json()) as { id: string; name: string }[];
      expect(Array.isArray(list)).toBe(true);
      expect(list.some((row) => row.id === item.id)).toBe(true);
    } finally {
      close();
    }
  });

  test("出品が無いユーザーの一覧は空配列が返る(200)", async () => {
    const { app, close } = createE2eApp();
    try {
      const user = await signUpEmailViaHttp(app, {
        name: "No items user",
        email: "no-items@example.com",
        password: MOCK_USER_PASSWORD,
      });

      const res = await app.request("/users/sellItems", {
        method: "GET",
        headers: { "x-e2e-user-id": user.id },
      });

      expect(res.status).toBe(200);
      const list = await res.json();
      expect(list).toEqual([]);
    } finally {
      close();
    }
  });
});

describe("GET /users/orders", () => {
  test("注文が無いユーザーの一覧は空配列が返る(200)", async () => {
    const { app, close } = createE2eApp();
    try {
      const user = await signUpEmailViaHttp(app, {
        name: "No orders user",
        email: "no-orders@example.com",
        password: MOCK_USER_PASSWORD,
      });

      const res = await app.request("/users/orders", {
        method: "GET",
        headers: { "x-e2e-user-id": user.id },
      });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    } finally {
      close();
    }
  });

  test("購入後にそのユーザーの注文一覧に注文が含まれる(200)", async () => {
    const { app, close } = createE2eApp();
    try {
      const { buyer, item } = await seedData(app);

      const purchaseRes = await app.request("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: buyer.id, itemId: item.id }),
      });
      expect(purchaseRes.status).toBe(201);
      const order = (await purchaseRes.json()) as { id: string };

      const res = await app.request("/users/orders", {
        method: "GET",
        headers: { "x-e2e-user-id": buyer.id },
      });

      expect(res.status).toBe(200);
      const list = (await res.json()) as { id: string; status: number }[];
      expect(list.some((row) => row.id === order.id)).toBe(true);
      expect(list.find((row) => row.id === order.id)?.status).toBe(
        OrderStatusMap.PURCHASED,
      );
    } finally {
      close();
    }
  });
});
