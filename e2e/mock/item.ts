import { MOCK_USER } from "./user";

export const MOCK_ITEM = {
  SAMPLE: {
    name: "Sample item",
    description: "E2E fixture",
    price: 1500,
    sellerId: MOCK_USER.SELLER.id,
  },
} as const;
