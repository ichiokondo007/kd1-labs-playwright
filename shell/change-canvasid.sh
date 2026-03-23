#!/bin/bash
#
# test-base.json 内の canvas ID (transitions.params[].id) を
# 指定した ID に一括置換するスクリプト
#
# Usage: ./change-canvasid.sh <new-canvas-id>
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_DIR="$SCRIPT_DIR/../src"
TARGET_FILE="$SRC_DIR/test-base.json"
BACKUP_DIR="$SRC_DIR/backup"

# 引数チェック
if [ $# -ne 1 ]; then
  echo "Usage: $0 <new-canvas-id>"
  echo "Example: $0 019cffa3-774c-7116-84f5-3e6df9cb9d49"
  exit 1
fi

NEW_ID="$1"

# 対象ファイル存在チェック
if [ ! -f "$TARGET_FILE" ]; then
  echo "Error: $TARGET_FILE が見つかりません"
  exit 1
fi

# バックアップディレクトリ作成（なければ作成）
mkdir -p "$BACKUP_DIR"

# タイムスタンプ付きバックアップ
TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
BACKUP_FILE="$BACKUP_DIR/${TIMESTAMP}_test-base.json"
cp "$TARGET_FILE" "$BACKUP_FILE"
echo "Backup: $BACKUP_FILE"

# jq で params 内の id を一括置換
TMP_FILE="$(mktemp)"
jq --arg newId "$NEW_ID" '
  .testcases |= map(
    .transitions.params |= map(.id = $newId)
  )
' "$TARGET_FILE" > "$TMP_FILE" && mv "$TMP_FILE" "$TARGET_FILE"

echo "Done: canvas ID を $NEW_ID に置換しました"
