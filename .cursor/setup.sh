#!/usr/bin/env bash
set -euo pipefail

# Cloud Agent 用のセットアップスクリプト（冪等）。
# environment.json の install から呼び出される。

cd "$(dirname "$0")/.."

# 依存関係を lockfile に厳密一致でインストール
npm ci

# SQLite ファイル用ディレクトリ（drizzle-kit は自動作成しない）
mkdir -p data

# 開発サーバ (npm run dev) は `--env-file=.env` を要求するため、
# .env が無ければ生成する。BETTER_AUTH_SECRET が環境変数（Cloud Agent
# のシークレット等）で与えられていればそれを使い、無ければランダム値を使う。
if [ ! -f .env ]; then
  {
    echo "BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET:-$(openssl rand -base64 32)}"
    echo "BETTER_AUTH_URL=${BETTER_AUTH_URL:-http://localhost:3000}"
    echo "SQLITE_PATH=${SQLITE_PATH:-./data/app.db}"
  } >.env
fi

# マイグレーションを適用（テーブル生成。冪等）
npm run db:migrate
