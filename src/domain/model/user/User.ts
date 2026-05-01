import { z } from "zod";
import { UserEmail } from "./UserEmail.js";
import { UserName } from "./UserName.js";

// --- Zod ブランド（ID）---

const userRecordIdSym = Symbol();
export const UserRecordId = z
  .union([z.number().int().positive(), z.null()])
  .brand(typeof userRecordIdSym);
export type UserRecordId = z.infer<typeof UserRecordId>;

// --- データ（状態）---

export type User = Readonly<{
  id: UserRecordId;
  name: UserName;
  email: UserEmail;
}>;

// --- 振る舞い（純粋関数）---

const create = (name: string, email: string): User => ({
  id: UserRecordId.parse(null),
  name: UserName.create(name),
  email: UserEmail.create(email),
});

/** DB から復元（不整合なら Email / Name 長で検証エラー） */
const reconstitute = (id: number, name: string, email: string): User => ({
  id: UserRecordId.parse(id),
  name: UserName.reconstitute(name),
  email: UserEmail.create(email),
});

const changeName = (user: User, name: string): User => ({
  ...user,
  name: UserName.create(name),
});

const changeEmail = (user: User, email: string): User => ({
  ...user,
  email: UserEmail.create(email),
});

// --- エンティティ(コンパニオンオブジェクト) ---

export const User = {
  create,
  reconstitute,
  changeName,
  changeEmail,
} as const;
