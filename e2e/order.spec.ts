import { describe, expect, test } from "vitest";
import { OrderStatusMap } from "../src/domain/model/order/OrderStatus.js";
import { createE2eApp, seedData } from "./config/setup.js";

describe("POST /orders", () => {
  test("出品中の商品を購入すると注文が作成され購入済みになる(201)", async () => {
    const { app, close } = createE2eApp();
    try {
      const { buyer, item } = await seedData(app);

      const res = await app.request("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: buyer.id, itemId: item.id }),
      });

      expect(res.status).toBe(201);
      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toMatchObject({
        userId: buyer.id,
        itemId: item.id,
        status: OrderStatusMap.PURCHASED,
      });
      expect(typeof body.id).toBe("string");
      expect(String(body.id).length).toBeGreaterThan(0);
    } finally {
      close();
    }
  });

  test("存在しない商品IDを指定するとNOT_FOUND_ENTITYが返る(404)", async () => {
    const { app, close } = createE2eApp();
    try {
      const registerRes = await app.request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Only user",
          email: "only@example.com",
        }),
      });
      expect(registerRes.status).toBe(201);
      const user = (await registerRes.json()) as { id: string };

      const res = await app.request("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          itemId: "missing-item-id",
        }),
      });

      expect(res.status).toBe(404);
      const body = (await res.json()) as { code?: string };
      expect(body.code).toBe("NOT_FOUND_ENTITY");
    } finally {
      close();
    }
  });
});

describe("GET /orders/:orderId", () => {
  test("購入直後の注文を取得すると注文詳細と履歴が返る(200)", async () => {
    const { app, close } = createE2eApp();
    try {
      const { buyer, item } = await seedData(app);

      const purchaseRes = await app.request("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: buyer.id, itemId: item.id }),
      });
      expect(purchaseRes.status).toBe(201);
      const created = (await purchaseRes.json()) as { id: string };

      const detailRes = await app.request(`/orders/${created.id}`, {
        method: "GET",
      });

      expect(detailRes.status).toBe(200);
      const detail = (await detailRes.json()) as {
        order: { id: string; status: number };
        histories: { orderId: string; toStatus: number }[];
      };

      expect(detail.order?.id).toBe(created.id);
      expect(detail.order?.status).toBe(OrderStatusMap.PURCHASED);
      expect(detail.histories.length).toBeGreaterThanOrEqual(1);
      expect(detail.histories[0]?.orderId).toBe(created.id);
    } finally {
      close();
    }
  });
});

describe("PUT /orders/:orderId/ship", () => {
  test("購入済みの注文を発送すると発送済みステータスが返る(200)", async () => {
    const { app, close } = createE2eApp();
    try {
      const { buyer, item } = await seedData(app);

      const purchaseRes = await app.request("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: buyer.id, itemId: item.id }),
      });
      const order = (await purchaseRes.json()) as { id: string };

      const shipRes = await app.request(`/orders/${order.id}/ship`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(shipRes.status).toBe(200);
      const shipped = (await shipRes.json()) as { status: number };
      expect(shipped.status).toBe(OrderStatusMap.SHIPPED);
    } finally {
      close();
    }
  });
});

describe("PUT /orders/:orderId/deliver", () => {
  test("発送済みの注文を配達完了にすると到着済みになり履歴が増える(200)", async () => {
    const { app, close } = createE2eApp();
    try {
      const { buyer, item } = await seedData(app);

      const purchaseRes = await app.request("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: buyer.id, itemId: item.id }),
      });
      const order = (await purchaseRes.json()) as { id: string };

      const shipRes = await app.request(`/orders/${order.id}/ship`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(shipRes.status).toBe(200);

      const deliverRes = await app.request(`/orders/${order.id}/deliver`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(deliverRes.status).toBe(200);
      const delivered = (await deliverRes.json()) as { status: number };
      expect(delivered.status).toBe(OrderStatusMap.DELIVERED);

      const detailRes = await app.request(`/orders/${order.id}`, {
        method: "GET",
      });
      const detail = (await detailRes.json()) as { histories: unknown[] };
      expect(detail.histories.length).toBeGreaterThanOrEqual(2);
    } finally {
      close();
    }
  });
});

describe("PUT /orders/:orderId/cancel", () => {
  test("購入済みの注文をキャンセルするとキャンセル済みになる(200)", async () => {
    const { app, close } = createE2eApp();
    try {
      const { buyer, item } = await seedData(app);

      const purchaseRes = await app.request("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: buyer.id, itemId: item.id }),
      });
      const order = (await purchaseRes.json()) as { id: string };

      const cancelRes = await app.request(`/orders/${order.id}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(cancelRes.status).toBe(200);
      const canceled = (await cancelRes.json()) as { status: number };
      expect(canceled.status).toBe(OrderStatusMap.CANCELED);
    } finally {
      close();
    }
  });
});
