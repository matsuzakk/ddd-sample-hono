import type { User } from "./User.js";

export interface IUserRepository {
  create(user: User): void;
  findById(id: string): User | null;
}
