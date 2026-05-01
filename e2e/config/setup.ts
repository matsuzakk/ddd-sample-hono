import { Hono } from "hono";
import { createApp } from "../../src/app.js";
import { createMemoryAppDatabase } from "../../src/infrastructure/database/test/testDb.js";
import type { AppVariables } from "../../src/env.js";
import { MOCK_ITEM } from "../mock/item.js";
import { MOCK_USER, MOCK_USER_PASSWORD } from "../mock/user.js";

export type E2eSignedUpUser = {
  readonly id: number;
  readonly name: string;
  readonly email: string;
};

/**
 * better-auth のメールサインアップ（`POST /auth/sign-up/email`）でユーザーを作成する。
 */
export const signUpEmailViaHttp = async (
  app: Hono<{ Variables: AppVariables }>,
  input: {
    readonly name: string;
    readonly email: string;
    readonly password: string;
  },
): Promise<E2eSignedUpUser> => {
  const res = await app.request("/auth/sign-up/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      password: input.password,
    }),
  });
  if (!res.ok) {
    throw new Error(`sign-up failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as {
    user: { id: string; name: string; email: string };
  };
  return {
    id: Number(body.user.id),
    name: body.user.name,
    email: body.user.email,
  };
};

export const createE2eApp = () => {
  const { db, close } = createMemoryAppDatabase();
  const app = createApp({ db });
  return { app, close };
};

export const seedData = async (app: Hono<{ Variables: AppVariables }>) => {
  const seller = await signUpEmailViaHttp(app, {
    name: MOCK_USER.SELLER.name,
    email: MOCK_USER.SELLER.email,
    password: MOCK_USER_PASSWORD,
  });

  const buyer = await signUpEmailViaHttp(app, {
    name: MOCK_USER.BUYER.name,
    email: MOCK_USER.BUYER.email,
    password: MOCK_USER_PASSWORD,
  });

  const itemRes = await app.request("/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-e2e-user-id": String(seller.id),
    },
    body: JSON.stringify({
      ...MOCK_ITEM.SAMPLE,
      sellerId: seller.id,
    }),
  });
  if (!itemRes.ok) {
    throw new Error(`seed item failed: ${itemRes.status}`);
  }
  const item = await itemRes.json();

  return { seller, buyer, item };
};
