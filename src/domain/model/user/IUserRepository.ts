import type { User } from "./User.js";

export interface IUserRepository {
  create(user: User): void;
  update(user: User): void;
}
