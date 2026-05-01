import { z } from "zod";
import { ValidationError } from "../../shared/error.js";

// --- Zod ブランド（商品説明）---

const itemDescriptionSym = Symbol();
const itemDescriptionSchema = z
  .string()
  .min(1, "Product description must be at least 1 character")
  .max(1000, "Product description must be at most 1000 characters")
  .brand(typeof itemDescriptionSym);

export type ItemDescription = z.infer<typeof itemDescriptionSchema>;

// --- Value Object(コンパニオンオブジェクト) ---

export const ItemDescription = {
  create(value: string): ItemDescription {
    const r = itemDescriptionSchema.safeParse(value);
    if (!r.success) {
      const message = r.error.issues[0]?.message;
      throw new ValidationError(message, { cause: r.error });
    }
    return r.data;
  },

  toValue(description: ItemDescription): string {
    return description as string;
  },

  equals(a: ItemDescription, b: ItemDescription): boolean {
    return a === b;
  },
} as const;
