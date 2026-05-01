import { z } from "zod";
import { ValidationError } from "../shared/error.js";

// --- Zod ブランド（メール）---

const emailSym = Symbol();
const emailSchema = z
  .string()
  .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  .brand(typeof emailSym);

export type UserEmail = z.infer<typeof emailSchema>;

// --- Value Object ---

export const UserEmail = {
  create(value: string): UserEmail {
    const r = emailSchema.safeParse(value);
    if (!r.success) {
      throw new ValidationError("Email must be valid");
    }
    return r.data;
  },

  isValid(value: string): boolean {
    return emailSchema.safeParse(value).success;
  },

  toValue(email: UserEmail): string {
    return email as string;
  },

  equals(a: UserEmail, b: UserEmail): boolean {
    return a === b;
  },
} as const;
