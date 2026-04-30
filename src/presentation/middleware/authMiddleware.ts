import type { MiddlewareHandler } from "hono";
import { createAuth } from "../../infrastructure/auth/index.js";
import type { DbVariables } from "./dbMiddleware.js";

/**
 * セッション検証をスキップするルート一覧。
 */
export const AUTH_EXCLUDED_ROUTES = [
  { method: "GET", path: "/health" },
] as const satisfies { method: string; path: string }[];

/**
 * セッション必須のエンドポイントを保護する認証ミドルウェア
 */
export const authMiddleware: MiddlewareHandler<{
  Variables: DbVariables;
}> = async (c, next) => {
  // E2Eテスト時はスキップ
  if (process.env.E2E === "true") {
    await next();
    return;
  }

  // 認証不要のルートの場合はスキップ
  if (
    c.req.path.startsWith("/auth") ||
    AUTH_EXCLUDED_ROUTES.some(
      (r) => r.path === c.req.path && r.method === c.req.method,
    )
  ) {
    await next();
    return;
  }

  // セッションが有効かどうかを検証
  const auth = createAuth(c.get("db"));
  const data = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!data?.user) {
    return c.json(
      {
        code: "UNAUTHENTICATED",
        message: "Authentication required",
      },
      400,
    );
  }

  await next();
};
