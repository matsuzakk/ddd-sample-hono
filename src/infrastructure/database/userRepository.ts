import { eq } from "drizzle-orm";
import type { User } from "../../domain/model/user/User.js";
import type { IUserRepository } from "../../domain/model/user/IUserRepository.js";
import type { DbClient } from "./db.js";
import { users } from "./schema.js";

export const createUserRepository = (db: DbClient): IUserRepository => ({
  create: async (user: User) => {
    await db.insert(users).values({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  },
  update: async (user: User) => {
    await db
      .update(users)
      .set({ name: user.name, email: user.email })
      .where(eq(users.id, user.id));
  },
});
