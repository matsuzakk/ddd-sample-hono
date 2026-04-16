import { createApp } from "../../src/app.js";
import { createMemoryAppDatabase } from "../../src/infrastructure/database/test/testDb.js";
import { MOCK_ITEM } from "../mock/item.js";
import { MOCK_USER } from "../mock/user.js";

export const createE2eApp = () => {
  const { db, close } = createMemoryAppDatabase();
  const app = createApp({ db });
  return { app, close };
};

export const seedData = async (app: App) => {
  const sellerRes = await app.request("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: MOCK_USER.SELLER.name,
      email: MOCK_USER.SELLER.email,
    }),
  });
  if (!sellerRes.ok) {
    throw new Error(`seed seller failed: ${sellerRes.status}`);
  }
  const seller = (await sellerRes.json()) as { id: string };

  const buyerRes = await app.request("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: MOCK_USER.BUYER.name,
      email: MOCK_USER.BUYER.email,
    }),
  });
  if (!buyerRes.ok) {
    throw new Error(`seed buyer failed: ${buyerRes.status}`);
  }
  const buyer = await buyerRes.json();

  const itemRes = await app.request("/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
