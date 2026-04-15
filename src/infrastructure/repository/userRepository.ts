import type { User } from "../../domain/model/user/User.js";
import type { IUserRepository } from "../../domain/model/user/IUserRepository.js";
import type { DbClient } from "../database/db.js";
import { users } from "../database/schema.js";

export const createUserRepository = (db: DbClient): IUserRepository => ({
  create: (user: User) => {
    db.insert(users)
      .values({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .run();
  },
});
