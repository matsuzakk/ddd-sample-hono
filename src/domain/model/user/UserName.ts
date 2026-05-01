import { z } from "zod";
import { ValidationError } from "../shared/error.js";

// --- Zod ブランド（表示名）---

const userNameSym = Symbol();
/** 最大 20 文字。空文字は `reconstitute` のみ許容（DB 復元用） */
const userNameSchema = z.string().max(20).brand(typeof userNameSym);

export type UserName = z.infer<typeof userNameSchema>;

const NAME_CREATE_ERROR = "Name must be between 1 and 20 characters";
const NAME_RECONSTITUTE_ERROR = "Name must be at most 20 characters";

// --- Value Object ---

export const UserName = {
  create(value: string): UserName {
    if (value.length < 1) {
      throw new ValidationError(NAME_CREATE_ERROR);
    }
    const r = userNameSchema.safeParse(value);
    if (!r.success) {
      throw new ValidationError(NAME_CREATE_ERROR);
    }
    return r.data;
  },

  /** DB 由来の文字列（長さは最大 20 のみ検証。空文字は許容） */
  reconstitute(value: string): UserName {
    const r = userNameSchema.safeParse(value);
    if (!r.success) {
      throw new ValidationError(NAME_RECONSTITUTE_ERROR);
    }
    return r.data;
  },

  isValid(value: string): boolean {
    return value.length >= 1 && value.length <= 20;
  },

  toValue(name: UserName): string {
    return name as string;
  },

  equals(a: UserName, b: UserName): boolean {
    return a === b;
  },
} as const;
