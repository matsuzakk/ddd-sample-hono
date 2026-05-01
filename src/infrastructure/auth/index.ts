import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { AppDatabase } from "../database/db.js";
import * as schema from "../database/schema.js";

export const createAuth = (db: AppDatabase) =>
  betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    basePath: "/auth",
    advanced: {
      database: {
        generateId: "serial",
      },
    },
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        ...schema,
        user: schema.users,
      },
    }),
    emailVerification: {
      sendOnSignUp: false,
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: false,
    },
    socialProviders: {
      // github: {
      //   clientId: env.GITHUB_CLIENT_ID,
      //   clientSecret: env.GITHUB_CLIENT_SECRET,
      // },
      // google: {
      //   clientId: env.GOOGLE_CLIENT_ID,
      //   clientSecret: env.GOOGLE_CLIENT_SECRET,
      // },
    },
  });
