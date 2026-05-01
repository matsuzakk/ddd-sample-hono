import type { User } from "./User.js";

export interface IUserRepository {
  create(user: User): number;
  findById(id: number): User | null;
}
