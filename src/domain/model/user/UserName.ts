import { z } from "zod";
import { ValidationError } from "../shared/error.js";

// --- Zod ブランド（表示名）---

const userNameSym = Symbol();
const userNameSchema = z
  .string()
  .max(20, "Name must be at most 20 characters")
  .brand(typeof userNameSym);

export type UserName = z.infer<typeof userNameSchema>;

// --- Value Object ---

export const UserName = {
  create(value: string): UserName {
    const r = userNameSchema.safeParse(value);
    if (!r.success) {
      const message = r.error.issues[0]?.message;
      throw new ValidationError(message, { cause: r.error });
    }
    if (value.length < 1) {
      throw new ValidationError(
        "Name must be between 1 and 20 characters",
      );
    }
    return r.data;
  },

  reconstitute(value: string): UserName {
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
