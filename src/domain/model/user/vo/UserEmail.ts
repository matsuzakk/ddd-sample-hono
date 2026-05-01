import { z } from "zod";
import { ValidationError } from "../../shared/error.js";

// --- Zod ブランド（メール）---

const emailSym = Symbol();
const emailSchema = z
  .string()
  .regex(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    "Email must be valid",
  )
  .brand(typeof emailSym);

export type UserEmail = z.infer<typeof emailSchema>;

// --- Value Object ---

export const UserEmail = {
  create(value: string): UserEmail {
    const r = emailSchema.safeParse(value);
    if (!r.success) {
      const message = r.error.issues[0]?.message;
      throw new ValidationError(message, { cause: r.error });
    }
    return r.data;
  },

  toValue(email: UserEmail): string {
    return email as string;
  },

  equals(a: UserEmail, b: UserEmail): boolean {
    return a === b;
  },
} as const;
