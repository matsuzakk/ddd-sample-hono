# API curl examples

Base URL: `http://localhost:3000`

`npm run dev` は `tsx` の `--env-file=.env` でプロジェクト直下の `.env` を読み込みます（`npm run start` のみの場合は `.env` は自動では読まれません。必要なら `node --env-file=.env dist/index.js` など）。

JSON のレスポンスはすべて `| jq` で整形しています。[jq](https://jqlang.org/) が未インストールの場合は `brew install jq` などで入れてください（`GET /health` はプレーンテキストのため `jq` なし）。

## Authentication (better-auth セッション)

`GET /health` と **`/auth` プレフィックス**（better-auth のルート）以外の API は、**有効なセッション Cookie** が無いと `400` と `{"code":"UNAUTHENTICATED","message":"Authentication required"}` が返ります。

### better-auth（`/auth` … 認証不要）

`createAuth` の `basePath` は `/auth`。Hono への載せ方は [Better Auth · Hono integration](https://www.better-auth.com/docs/integrations/hono) と同様に `auth.handler(c.req.raw)` を **`/auth/*`** にマウントしています（`app.route("/auth", handler)` は `handler` が `Hono` でないため使えません）。

代表的なエンドポイント（公式パス）:

| 用途           | メソッドとパス                        |
| -------------- | ------------------------------------- |
| サインイン     | `POST /auth/sign-in/email`            |
| サインアップ   | `POST /auth/sign-up/email`            |
| セッション取得 | `GET` または `POST /auth/get-session` |

### Cookie ジャーで curl する（`-c` / `-b`）

- **`-c cookies.txt`** … レスポンスの `Set-Cookie` を `cookies.txt` に保存（新規作成または追記・更新）。
- **`-b cookies.txt`** … `cookies.txt` に入っている Cookie をリクエストに付与。

サインインして Cookie を保存する例（以降の例ではプロジェクト直下の `cookies.txt` を想定。git にコミットしないでください）:

```bash
curl -sS -c cookies.txt -X POST "http://localhost:3000/auth/sign-in/email" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"password123"}' | jq
```

現在のセッション確認:

```bash
curl -sS -b cookies.txt "http://localhost:3000/auth/get-session" | jq
```

サインアップ（メール＋パスワード。パスワードは better-auth のデフォルトで **8 文字以上**）:

```bash
curl -sS -c cookies.txt -X POST "http://localhost:3000/auth/sign-up/email" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@example.com","password":"password123"}' | jq
```

本リポジトリの `createAuth` は `emailAndPassword.autoSignIn: false` のため、**サインアップ直後はセッション Cookie が付かない**ことがあります。その場合は続けてサインインを `-b cookies.txt -c cookies.txt` で実行し、同じファイルにセッションを載せてください。

```bash
curl -sS -b cookies.txt -c cookies.txt -X POST "http://localhost:3000/auth/sign-in/email" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"password123"}' | jq
```

### それ以外の API

以降の例では、**Cookie が必要なリクエスト**に **`-b cookies.txt`** を付けています（上記でサインイン済みの `cookies.txt` を用意してください）。

## Health

`GET /health`（プレーンテキスト、`jq` なし）

```bash
curl -sS "http://localhost:3000/health"
```

## Users (`/users`)

### List items sold by user (my listings)

`GET /users/:userId/items` … **要セッション**

```bash
curl -sS "http://localhost:3000/users/sellItems" \
  -b cookies.txt | jq
```

### List orders for user (purchases as buyer)

`GET /users/:userId/orders` … **要セッション**

```bash
curl -sS "http://localhost:3000/users/orders" \
  -b cookies.txt | jq
```

## Items (`/items`)

### Sell item (list for sale)

`POST /items` … **要セッション**

```bash
curl -sS -X POST "http://localhost:3000/items" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Used book","description":"Good condition","price":1200}' | jq
```

### List all items

`GET /items` … **要セッション**

```bash
curl -sS "http://localhost:3000/items" \
  -b cookies.txt | jq
```

### Get item detail

`GET /items/:itemId` … **要セッション**

```bash
curl -sS "http://localhost:3000/items/ITEM_ID_HERE" \
  -b cookies.txt | jq
```

## Orders (`/orders`)

### Purchase item

`POST /orders` … **要セッション**

```bash
curl -sS -X POST "http://localhost:3000/orders" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"userId":"BUYER_USER_ID","itemId":"ITEM_ID_HERE"}' | jq
```

### Cancel order (purchased only)

`PUT /orders/:orderId/cancel` … **要セッション**

```bash
curl -sS -X PUT "http://localhost:3000/orders/ORDER_ID_HERE/cancel" \
  -b cookies.txt | jq
```

### Mark shipped

`PUT /orders/:orderId/ship` … **要セッション**

```bash
curl -sS -X PUT "http://localhost:3000/orders/ORDER_ID_HERE/ship" \
  -b cookies.txt | jq
```

### Mark delivered

`PUT /orders/:orderId/deliver` … **要セッション**

```bash
curl -sS -X PUT "http://localhost:3000/orders/ORDER_ID_HERE/deliver" \
  -b cookies.txt | jq
```

### Order detail + status histories

`GET /orders/:orderId` … **要セッション**

```bash
curl -sS "http://localhost:3000/orders/ORDER_ID_HERE" \
  -b cookies.txt | jq
```

Replace `USER_ID_HERE`, `ITEM_ID_HERE`, and `ORDER_ID_HERE` with IDs from API responses. Use the same `cookies.txt` path as after sign-in, or give `-b` an absolute path if the file lives elsewhere.
