# マルチユーザーワークフローテスト対応 Plan

## 背景

現在のフレームワークは **1ユーザー = 1テストケース（並列実行）** の設計。
「Aさん申請 → Bさん承認 → Cさん却下 → Aさんに再申請が出る」のような**順序依存のマルチユーザーフロー**に対応したい。

---

## 案1: `workflow-base.json` を新設（推奨）

`test-base.json` とは別に、ワークフロー用の定義ファイルを作る。

### workflow-base.json

```json
{
  "_purpose": "申請→承認→却下→再申請フロー",
  "workflows": [
    {
      "workflowName": "expense-approval-flow",
      "steps": [
        {
          "stepName": "Aさんが申請",
          "login": { "username": "tanaka", "password": "password" },
          "transitions": { "pageurl": "/申請", "data-testid": "page-shinsei" },
          "usecase": { "usecase-id": "submit-application", "params": { "title": "経費申請" } }
        },
        {
          "stepName": "Bさんが承認",
          "login": { "username": "suzuki", "password": "password" },
          "transitions": { "pageurl": "/承認一覧", "data-testid": "page-approval" },
          "usecase": { "usecase-id": "approve-application", "params": {} }
        },
        {
          "stepName": "Cさんが却下",
          "login": { "username": "yamada", "password": "password" },
          "transitions": { "pageurl": "/承認一覧", "data-testid": "page-approval" },
          "usecase": { "usecase-id": "reject-application", "params": { "reason": "金額超過" } }
        },
        {
          "stepName": "Aさんに再申請が表示される",
          "login": { "username": "tanaka", "password": "password" },
          "transitions": { "pageurl": "/マイ申請", "data-testid": "page-my-apps" },
          "usecase": { "usecase-id": "verify-resubmit", "params": {} }
        }
      ]
    }
  ]
}
```

### workflow-runner.spec.ts

```typescript
import { test } from '@playwright/test';
import workflowBase from './workflow-base.json';
import { login } from './functions/login';
import { transition } from './functions/transition';
import { loadUsecase } from './functions/usecase-loader';

for (const wf of workflowBase.workflows) {
  test.describe(wf.workflowName, () => {
    // ステップは順序実行（直列）
    test.describe.configure({ mode: 'serial' });

    for (const step of wf.steps) {
      test(step.stepName, async ({ browser }) => {
        // ステップごとに新しいコンテキスト（=別ユーザー）
        const context = await browser.newContext();
        const page = await context.newPage();

        await page.goto('/login');
        await login(page, step.login);
        await transition(page, step.transitions);

        const usecase = loadUsecase(step.usecase['usecase-id']);
        await usecase(page, step.usecase.params);

        await context.close();
      });
    }
  });
}
```

### ポイント

- `test.describe.configure({ mode: 'serial' })` でステップを直列実行
- 既存の `test-base.json` / `test-runner.spec.ts` に手を入れない
- 並列テスト（CRDT）とワークフローテスト（承認フロー）を完全に分離

---

## 案2: 既存の `test-base.json` を拡張

`test-base.json` に `mode` フィールドを追加して、並列/直列を切り替える。

### test-base.json の変更

```json
{
  "_purpose": "申請フロー",
  "mode": "serial",
  "testcases": [
    { "testName": "step1-申請", "login": { "username": "tanaka", "..." : "..." }, "..." : "..." },
    { "testName": "step2-承認", "login": { "username": "suzuki", "..." : "..." }, "..." : "..." }
  ]
}
```

### test-runner.spec.ts の修正

`mode` を読み取り、`serial` の場合は `test.describe.configure({ mode: 'serial' })` を適用する。

---

## 案3: 1テスト内で複数コンテキスト

ワークフロー全体を1つのusecaseとして実装する。

### test-base.json

```json
{
  "testName": "expense-flow",
  "login": { "username": "system", "password": "password" },
  "usecase": {
    "usecase-id": "expense-approval-workflow",
    "params": {
      "users": {
        "applicant": { "username": "tanaka", "password": "password" },
        "approver":  { "username": "suzuki", "password": "password" },
        "rejector":  { "username": "yamada", "password": "password" }
      }
    }
  }
}
```

usecase内で `browser.newContext()` を使って複数ユーザーを操作する。

---

## 比較表

| | 案1: workflow-base.json | 案2: test-base拡張 | 案3: usecase内で完結 |
|---|---|---|---|
| **既存への影響** | なし（新ファイル追加のみ） | test-runner修正が必要 | 既存構造に収まる |
| **見通しの良さ** | ステップが明確 | modeの分岐が増える | usecase内が複雑化 |
| **レポート** | ステップごとに成功/失敗が見える | 同上 | 1テストにまとまる |
| **再利用性** | ステップ単位で組み替え可能 | 同上 | ワークフロー単位 |

## 推奨

**案1** を推奨。既存の並列テスト（CRDT）に影響を与えず、ワークフローテストを独立して管理できる。

---

## Playwright 参考: 複数ユーザーの基本パターン

Playwrightでは `browser.newContext()` で独立したブラウザセッションを作成できる。
各コンテキストは Cookie やセッションが完全に分離されるため、同時に複数ユーザーとして操作可能。

- `storageState` で認証状態をJSONに保存/復元できる（global setupで事前ログイン）
- カスタム Fixture で `applicant` / `approver` / `reviewer` のようなロール別Pageを提供可能
