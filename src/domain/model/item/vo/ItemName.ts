import { z } from "zod";
import { ValidationError } from "../../shared/error.js";

// --- Zod ブランド（商品名）---

const itemNameSym = Symbol();
const itemNameSchema = z
  .string()
  .min(1, "Product name must be at least 1 character")
  .max(20, "Product name must be at most 20 characters")
  .brand(typeof itemNameSym);

export type ItemName = z.infer<typeof itemNameSchema>;

// --- Value Object(コンパニオンオブジェクト) ---

export const ItemName = {
  create(value: string): ItemName {
    const r = itemNameSchema.safeParse(value);
    if (!r.success) {
      const message = r.error.issues[0]?.message;
      throw new ValidationError(message, { cause: r.error });
    }
    return r.data;
  },

  reconstitute(value: string): ItemName {
    const r = itemNameSchema.safeParse(value);
    if (!r.success) {
      const message = r.error.issues[0]?.message;
      throw new ValidationError(message, { cause: r.error });
    }
    return r.data;
  },

  toValue(name: ItemName): string {
    return name as string;
  },

  equals(a: ItemName, b: ItemName): boolean {
    return a === b;
  },
} as const;
