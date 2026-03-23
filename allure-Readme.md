# Allure Report + Playwright セットアップガイド

## 前提条件

- Docker / Docker Compose
- Node.js
- pnpm（kd1-labs monorepo）

## 1. パッケージインストール

```bash
pnpm add -D @playwright/test allure-playwright
```

## 2. Allure サービス起動

```bash
docker compose up -d
```

起動後のアクセス先:
- **Allure API / レポート**: http://localhost:5050
- **Allure UI（ダッシュボード）**: http://localhost:5252

## 3. テスト実行

```bash
pnpm playwright test
```

`allure-results/` ディレクトリにJSON結果ファイルが生成されます。
`CHECK_RESULTS_EVERY_SECONDS: 3` の設定により、Allure Docker Service が
自動検出してレポートを再生成します。

## 4. レポート確認

ブラウザで以下にアクセス:

- **最新レポート**: http://localhost:5050/allure-docker-service/latest-report
- **UI ダッシュボード**: http://localhost:5252

## 運用ワークフロー

```
テスト実行 → allure-results/ 生成
     ↓
Allure Docker Service が自動検出（または API 経由）
     ↓
レポート生成（履歴付き）
     ↓
ブラウザで確認（Trend / History グラフ表示）
```

## 主要な環境変数

| 変数 | 説明 | デフォルト |
|------|------|-----------|
| `CHECK_RESULTS_EVERY_SECONDS` | 結果ディレクトリの監視間隔（秒）。`NONE`でAPI専用 | `NONE` |
| `KEEP_HISTORY` | 履歴保持の有効化。`1`で有効 | `0` |
| `KEEP_HISTORY_LATEST` | 保持する履歴の最大件数 | `20` |

## API経由でのレポート生成（CI利用時）

テスト実行後にAPI呼び出しでレポートを生成する方式:

```bash
# 結果を送信
curl -X POST http://localhost:5050/allure-docker-service/send-results \
  -H 'Content-Type: multipart/form-data' \
  -F 'files[]=@allure-results/xxx-result.json'

# レポート生成
curl -X GET http://localhost:5050/allure-docker-service/generate-report
```

## allure-results のクリーンアップ

次のテスト実行前に前回の結果をクリアする場合:

```bash
# 結果ファイルをクリア（レポート履歴は保持される）
curl -X GET http://localhost:5050/allure-docker-service/clean-results
```

## 注意事項

- `allure-results/` は `.gitignore` に追加してください
- `KEEP_HISTORY_LATEST: 25` で直近25回分の履歴が保持されます
- Docker Volume `allure-reports` にレポートデータが永続化されます
