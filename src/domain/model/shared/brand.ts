/**
 * ブランド型を定義する
 * @param K - ブランド型の基底型
 * @param T - ブランド型のラベル
 * @returns ブランド型
 */
export type Brand<K, T> = K & { readonly __brand: T };
