import { eq } from "drizzle-orm";
import { users } from "./schema.js";
export const createUserRepository = (db) => ({
    create: async (user) => {
        await db.insert(users).values({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    },
    update: async (user) => {
        await db
            .update(users)
            .set({ name: user.name, email: user.email })
            .where(eq(users.id, user.id));
    },
});
