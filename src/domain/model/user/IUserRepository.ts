import { User } from "./User.js";

export interface IUserRepository {
  create(user: User): Promise<void>;
  update(user: User): Promise<void>;
}
