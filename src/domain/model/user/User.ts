import type { Brand } from "../shared/brand.js";
import { ValidationError } from "../shared/error.js";

export type Email = Brand<string, "Email">;

export const Email = {
  create(value: string): Email {
    if (!Email.isValid(value)) {
      throw new ValidationError("Email must be valid");
    }
    return value as Email;
  },

  isValid(value: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
  },

  toValue(email: Email): string {
    return email as string;
  },

  equals(a: Email, b: Email): boolean {
    return a === b;
  },
} as const;

export type User = {
  readonly id: string;
  readonly name: string;
  readonly email: Email;
};

function isValidName(name: string): boolean {
  return name.length >= 1 && name.length <= 20;
}

export const User = {
  create(id: string, name: string, email: string): User {
    if (!isValidName(name)) {
      throw new ValidationError("Name must be between 1 and 20 characters");
    }
    return {
      id,
      name,
      email: Email.create(email),
    };
  },

  /** DB から復元（不整合なら Email で検証エラー） */
  reconstitute(id: string, name: string, email: string): User {
    return {
      id,
      name,
      email: Email.create(email),
    };
  },

  changeName(user: User, name: string): User {
    if (!isValidName(name)) {
      throw new ValidationError("Name must be between 1 and 20 characters");
    }
    return { ...user, name };
  },

  changeEmail(user: User, email: string): User {
    return { ...user, email: Email.create(email) };
  },
} as const;
