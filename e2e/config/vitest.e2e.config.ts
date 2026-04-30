import { defineConfig } from "vitest/config";

const e2eBetterAuthSecret =
  process.env.BETTER_AUTH_SECRET ??
  "e2e-test-better-auth-secret-32chars-min";

export default defineConfig({
  test: {
    environment: "node",
    include: ["e2e/**/*.spec.ts"],
    env: {
      BETTER_AUTH_SECRET: e2eBetterAuthSecret,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    },
  },
});
