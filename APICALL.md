# API curl examples

Base URL: `http://localhost:3000`

JSON のレスポンスはすべて `| jq` で整形しています。[jq](https://jqlang.org/) が未インストールの場合は `brew install jq` などで入れてください（`GET /` はプレーンテキストのため `jq` なし）。

## Users (`/users`)

### Register user

`POST /users`

```bash
curl -sS -X POST "http://localhost:3000/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@example.com"}' | jq
```

### List items sold by user (my listings)

`GET /users/:userId/items`

```bash
curl -sS "http://localhost:3000/users/USER_ID_HERE/items" | jq
```

### List orders for user (purchases as buyer)

`GET /users/:userId/orders`

```bash
curl -sS "http://localhost:3000/users/USER_ID_HERE/orders" | jq
```

## Items (`/items`)

### Create item (list for sale)

`POST /items`

```bash
curl -sS -X POST "http://localhost:3000/items" \
  -H "Content-Type: application/json" \
  -d '{"sellerId":"SELLER_USER_ID","name":"Used book","description":"Good condition","price":1200}' | jq
```

### List all items

`GET /items`

```bash
curl -sS "http://localhost:3000/items" | jq
```

### Get item detail

`GET /items/:itemId`

```bash
curl -sS "http://localhost:3000/items/ITEM_ID_HERE" | jq
```

## Orders (`/orders`)

### Purchase item

`POST /orders`

```bash
curl -sS -X POST "http://localhost:3000/orders" \
  -H "Content-Type: application/json" \
  -d '{"userId":"BUYER_USER_ID","itemId":"ITEM_ID_HERE"}' | jq
```

### Cancel order (purchased only)

`PUT /orders/:orderId/cancel`

```bash
curl -sS -X PUT "http://localhost:3000/orders/ORDER_ID_HERE/cancel" | jq
```

### Mark shipped

`PUT /orders/:orderId/ship`

```bash
curl -sS -X PUT "http://localhost:3000/orders/ORDER_ID_HERE/ship" | jq
```

### Mark delivered

`PUT /orders/:orderId/deliver`

```bash
curl -sS -X PUT "http://localhost:3000/orders/ORDER_ID_HERE/deliver" | jq
```

### Order detail + status histories

`GET /orders/:orderId`

```bash
curl -sS "http://localhost:3000/orders/ORDER_ID_HERE" | jq
```

## Root

`GET /`（JSON ではないため `jq` なし）

```bash
curl -sS "http://localhost:3000/"
```

Replace `USER_ID_HERE`, `ITEM_ID_HERE`, and `ORDER_ID_HERE` with IDs from API responses.
