import { z } from "zod";
import { ValidationError } from "../../shared/error.js";

// --- Zod ブランド（表示名）---

const userNameSym = Symbol();
const userNameSchema = z
  .string()
  .min(1, "Name must be at least 1 character")
  .max(20, "Name must be at most 20 characters")
  .brand(typeof userNameSym);

export type UserName = z.infer<typeof userNameSchema>;

// --- Value Object(コンパニオンオブジェクト) ---

export const UserName = {
  create(value: string): UserName {
    const r = userNameSchema.safeParse(value);
    if (!r.success) {
      const message = r.error.issues[0]?.message;
      throw new ValidationError(message, { cause: r.error });
    }
    return r.data;
  },

  toValue(name: UserName): string {
    return name as string;
  },

  equals(a: UserName, b: UserName): boolean {
    return a === b;
  },
} as const;
