#!/bin/bash
set -euo pipefail

REPO_URL="https://github.com/ichiokondo007/kd1-labs-playwright.git"
INSTALL_DIR="$HOME/dragon-fly"
REPO_NAME="kd1-labs-playwright"
DEFAULT_BASE_URL="https://kd1-tech.net"

BASE_URL="${1:-$DEFAULT_BASE_URL}"

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

if [ -d "$REPO_NAME" ]; then
  echo "$REPO_NAME は既に存在します。git pull で更新します。"
  cd "$REPO_NAME" && git pull
else
  git clone "$REPO_URL"
  cd "$REPO_NAME"
fi

cp apps/e2e/.env.example apps/e2e/.env
sed -i "s|^BASE_URL=.*|BASE_URL=$BASE_URL|" apps/e2e/.env

echo "セットアップ完了: apps/e2e/.env の BASE_URL=$BASE_URL"
echo "テスト実行: cd $INSTALL_DIR/$REPO_NAME && docker compose up"
