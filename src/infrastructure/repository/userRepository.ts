import { eq } from "drizzle-orm";
import type { IUserRepository } from "../../domain/model/user/IUserRepository.js";
import { Email, type User, User as UserEntity } from "../../domain/model/user/User.js";
import type { DbClient } from "../database/db.js";
import { users } from "../database/schema.js";

export const createUserRepository = (db: DbClient): IUserRepository => ({
  create: (user: User) => {
    const row = db
      .insert(users)
      .values({
        name: user.name,
        email: Email.toValue(user.email),
      })
      .returning({ id: users.id })
      .all()[0];
    if (!row) {
      throw new Error("Failed to insert user");
    }
    return row.id;
  },
  findById: (id: number): User | null => {
    const row = db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .all()[0];
    return row ? UserEntity.reconstitute(row.id, row.name, row.email) : null;
  },
});
