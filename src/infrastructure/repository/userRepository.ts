import { eq } from "drizzle-orm";
import type { IUserRepository } from "../../domain/model/user/IUserRepository.js";
import { type User, User as UserEntity } from "../../domain/model/user/User.js";
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
  findById: (id: string): User | null => {
    const row = db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .all()[0];
    return row ? UserEntity.reconstitute(row.id, row.name, row.email) : null;
  },
});
