import { z } from "zod";
import { UserEmail } from "./vo/UserEmail.js";
import { UserName } from "./vo/UserName.js";

// --- データ（状態）---

export type User = Readonly<{
  id: number | null;
  name: UserName;
  email: UserEmail;
}>;

// --- 振る舞い（純粋関数）---

/**
 * ユーザーを作成する
 * @param name - ユーザー名
 * @param email - ユーザーのメールアドレス
 * @returns 作成されたユーザー
 */
const create = (name: string, email: string): User => ({
  id: null,
  name: UserName.create(name),
  email: UserEmail.create(email),
});

/**
 * ユーザーを復元する
 * @param id - ユーザーID
 * @param name - ユーザー名
 * @param email - ユーザーのメールアドレス
 * @returns 復元されたユーザー
 */
const reconstitute = (id: number, name: string, email: string): User => ({
  id,
  name: UserName.create(name),
  email: UserEmail.create(email),
});

/**
 * ユーザー名を変更する
 * @param user - ユーザー
 * @param name - 新しいユーザー名
 * @returns 名前が変更されたユーザー
 */
const changeName = (user: User, name: string): User => ({
  ...user,
  name: UserName.create(name),
});

/**
 * ユーザーのメールアドレスを変更する
 * @param user - ユーザー
 * @param email - 新しいユーザーのメールアドレス
 * @returns メールアドレスが変更されたユーザー
 */
const changeEmail = (user: User, email: string): User => ({
  ...user,
  email: UserEmail.create(email),
});

// --- エンティティ ---

export const User = {
  create,
  reconstitute,
  changeName,
  changeEmail,
} as const;
