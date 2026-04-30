# API curl examples

Base URL: `http://localhost:3000`

`npm run dev` は `tsx` の `--env-file=.env` でプロジェクト直下の `.env` を読み込みます（`npm run start` のみの場合は `.env` は自動では読まれません。必要なら `node --env-file=.env dist/index.js` など）。

JSON のレスポンスはすべて `| jq` で整形しています。[jq](https://jqlang.org/) が未インストールの場合は `brew install jq` などで入れてください（`GET /health` はプレーンテキストのため `jq` なし）。

## 認証

代表的なエンドポイント（better-auth）:

| 用途           | メソッドとパス                        |
| -------------- | ------------------------------------- |
| サインアップ   | `POST /auth/sign-up/email`            |
| サインイン     | `POST /auth/sign-in/email`            |
| セッション取得 | `GET` または `POST /auth/get-session` |

### サインアップ

メール＋パスワードでサインアップします。

```bash
curl -sS -c cookies.txt -X POST "http://localhost:3000/auth/sign-up/email" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@example.com","password":"password123"}' | jq
```

本リポジトリの `createAuth` は `emailAndPassword.autoSignIn: false` のため、**サインアップ直後はセッション Cookie が付かない**。
その場合は続けてサインインを実行し、同じファイルにセッションを載せてください。

### サインイン

Cookie を保存する例（以降の例ではプロジェクト直下の `cookies.txt` を想定。git にコミットしないでください）:

```bash
curl -sS -c cookies.txt -X POST "http://localhost:3000/auth/sign-in/email" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"password123"}' | jq
```

### 現在のセッション確認

```bash
curl -sS -b cookies.txt "http://localhost:3000/auth/get-session" | jq
```

## Health

`GET /health`（プレーンテキスト、`jq` なし）

```bash
curl -sS "http://localhost:3000/health"
```

## Users (`/users`)

### ユーザーが出品した商品一覧を取得する

`GET /users/:userId/items` … **要セッション**

```bash
curl -sS "http://localhost:3000/users/sellItems" \
  -b cookies.txt | jq
```

### ユーザーの注文履歴を取得する

`GET /users/:userId/orders` … **要セッション**

```bash
curl -sS "http://localhost:3000/users/orders" \
  -b cookies.txt | jq
```

## Items (`/items`)

### 自分が出品した商品一覧を取得する

`POST /items` … **要セッション**

```bash
curl -sS -X POST "http://localhost:3000/items" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Used book","description":"Good condition","price":1200}' | jq
```

### 出品されている商品一覧を取得する

`GET /items` … **要セッション**

```bash
curl -sS "http://localhost:3000/items" \
  -b cookies.txt | jq
```

### 商品詳細を取得する

`GET /items/:itemId` … **要セッション**

```bash
curl -sS "http://localhost:3000/items/ITEM_ID_HERE" \
  -b cookies.txt | jq
```

## Orders (`/orders`)

### 商品を購入する

`POST /orders` … **要セッション**

```bash
curl -sS -X POST "http://localhost:3000/orders" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"userId":"BUYER_USER_ID","itemId":"ITEM_ID_HERE"}' | jq
```

### 注文をキャンセルする

`PUT /orders/:orderId/cancel` … **要セッション**

```bash
curl -sS -X PUT "http://localhost:3000/orders/ORDER_ID_HERE/cancel" \
  -b cookies.txt | jq
```

### 注文を発送する

`PUT /orders/:orderId/ship` … **要セッション**

```bash
curl -sS -X PUT "http://localhost:3000/orders/ORDER_ID_HERE/ship" \
  -b cookies.txt | jq
```

### 注文を配達完了にする

`PUT /orders/:orderId/deliver` … **要セッション**

```bash
curl -sS -X PUT "http://localhost:3000/orders/ORDER_ID_HERE/deliver" \
  -b cookies.txt | jq
```

### 注文詳細を取得する

`GET /orders/:orderId` … **要セッション**

```bash
curl -sS "http://localhost:3000/orders/ORDER_ID_HERE" \
  -b cookies.txt | jq
```

Replace `USER_ID_HERE`, `ITEM_ID_HERE`, and `ORDER_ID_HERE` with IDs from API responses. Use the same `cookies.txt` path as after sign-in, or give `-b` an absolute path if the file lives elsewhere.
