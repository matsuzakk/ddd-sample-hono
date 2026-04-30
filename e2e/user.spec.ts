import { describe, expect, test } from "vitest";
import { OrderStatusMap } from "../src/domain/model/order/OrderStatus.js";
import { createE2eApp, seedData } from "./config/setup.js";
import { MOCK_USER, MOCK_USER_PASSWORD } from "./mock/user.js";

describe("POST /users", () => {
  test("名前とメールでユーザーを登録すると作成されたユーザーが返る(201)", async () => {
    const { app, close } = createE2eApp();
    try {
      const res = await app.request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: MOCK_USER.SELLER.name,
          email: MOCK_USER.SELLER.email,
          password: MOCK_USER_PASSWORD,
        }),
      });

      expect(res.status).toBe(201);
      const body = (await res.json()) as {
        id: string;
        name: string;
        email: string;
      };
      expect(body.name).toBe(MOCK_USER.SELLER.name);
      expect(body.email).toBe(MOCK_USER.SELLER.email);
      expect(typeof body.id).toBe("string");
      expect(body.id.length).toBeGreaterThan(0);
    } finally {
      close();
    }
  });

  test("不正なメール形式だとENTITY_VALIDATION_ERRORが返る(400)", async () => {
    const { app, close } = createE2eApp();
    try {
      const res = await app.request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Valid name",
          email: "not-an-email",
          password: MOCK_USER_PASSWORD,
        }),
      });

      expect(res.status).toBe(400);
      const body = (await res.json()) as { code?: string };
      expect(body.code).toBe("ENTITY_VALIDATION_ERROR");
    } finally {
      close();
    }
  });

  test("名前が空だとENTITY_VALIDATION_ERRORが返る(400)", async () => {
    const { app, close } = createE2eApp();
    try {
      const res = await app.request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          email: "empty-name@example.com",
          password: MOCK_USER_PASSWORD,
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

describe("GET /users/:userId/items", () => {
  test("出品者の出品一覧にシードした商品が含まれる(200)", async () => {
    const { app, close } = createE2eApp();
    try {
      const { seller, item } = await seedData(app);

      const res = await app.request(`/users/${seller.id}/items`, {
        method: "GET",
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
      const registerRes = await app.request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "No items user",
          email: "no-items@example.com",
          password: MOCK_USER_PASSWORD,
        }),
      });
      expect(registerRes.status).toBe(201);
      const user = (await registerRes.json()) as { id: string };

      const res = await app.request(`/users/${user.id}/items`, {
        method: "GET",
      });

      expect(res.status).toBe(200);
      const list = await res.json();
      expect(list).toEqual([]);
    } finally {
      close();
    }
  });
});

describe("GET /users/:userId/orders", () => {
  test("注文が無いユーザーの一覧は空配列が返る(200)", async () => {
    const { app, close } = createE2eApp();
    try {
      const registerRes = await app.request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "No orders user",
          email: "no-orders@example.com",
          password: MOCK_USER_PASSWORD,
        }),
      });
      expect(registerRes.status).toBe(201);
      const user = (await registerRes.json()) as { id: string };

      const res = await app.request(`/users/${user.id}/orders`, {
        method: "GET",
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

      const res = await app.request(`/users/${buyer.id}/orders`, {
        method: "GET",
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
