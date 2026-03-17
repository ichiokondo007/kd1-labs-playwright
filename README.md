# kd1-labs-playwright

Playwright による E2E テストプロジェクト。

## CRDT（同時ログイン・メモリ確認）テスト

`src/test-base.json` の yjs-circle-add 系テストは **CRDT（Yjs 共同編集）の同時ログイン・メモリ確認用**です。

- 複数ユーザーが並列で同一キャンバスにログインし、それぞれ circle を追加する
- 同時ログイン時の負荷を想定し、全 testcase で `login.timeoutMs` を 20000ms に設定している
- 並列数は `PLAYWRIGHT_WORKERS` で指定可能（例: `PLAYWRIGHT_WORKERS=5 pnpm test`）

## 実行

```bash
pnpm install
pnpm test              # ヘッドレス
pnpm test:headed       # ブラウザ表示
pnpm test:ui           # UI モード
```

環境変数は `.env` を参照（`BASE_URL`, `HEADLESS`, `TIMEOUT`, `ACTION_TIMEOUT`, `PLAYWRIGHT_WORKERS` など）。
