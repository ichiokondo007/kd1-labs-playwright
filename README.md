# playwright custome FW

Playwright による E2E FW

## 🚀Puropose

### 【基本】

- 関心事の分離を行う。1テスト内に複数のテスト観点で作成しない。
- クリーンアーキテクチャのSOLID原則にて、同じシーケンスでテストを作成。

### 【目的】

1. 保守、維持管理観点でのクリンーンアーキテクチャのSOLID原則に則ったテスト作成を行う事を目的としたFW
2. テスト結果エビデンス、ログの統一化目的
3. テスト作成者（AI含む）の統一した各責務単位での実装をルール化。
4. playwrightの「Test Suite」のルール化
   - test.spec単位
   - test()
   - test.step()
5. フレイキー対策
   - Playwrightの全体学習コストなく作成可能なボイラーテンプレート提供。
   - 評価時のルールを定型化。

---

## 🚀FW提供テスト種類

FWでは以下2種類のtest suiteを用意

| 種別                     | spec ファイル         | JSON プレフィックス | 概要                               |
| ------------------------ | --------------------- | ------------------- | ---------------------------------- |
| single-user-test         | `single-user.spec.ts` | `single-user*.json` | 1ユーザー1テストケースの単体テスト |
| cross-user-workflow-test | (今後追加)            | (今後追加)          | 複数ユーザー連携のテスト           |

### single-user-test

single-user-testは、１ユーザのログイン（１ブラウザ）のみで完結するテストを実行する共通specを提供。
sing-user-test.jsonがテストとなります。


```json

{
  "_purpose": "5人でCRDT 同時ログイン・メモリ確認用。複数ユーザーが並列で同一キャンバスにログインし circle を追加する。同時ログイン時の負荷を想定し、全 testcase で login.timeoutMs を多めに設定している。",
  "testcases": [
    {
      "testName": "yjs-circle-add-1",
      "login": {
        "username": "ichio",
        "password": "password",
        "timeoutMs": 20000
      },
      "transitions": {
        "pageurl": "/example/canvas-yjs/:id",
        "params": [
          {
            "id": "019d0c7b-846a-728c-a919-8a00d524179a"
          }
        ],
        "description": "「svg add test」 canvas編集画面に遷移する",
        "data-testid": "page-canvas-yjs-editor"
      },
      "usecase": [
        {
          "usecase-id": "svg-add",
          "description": "yjs collab canvas画面で、任意のcanvasにログインし circleを作成する",
          "params-description": "circleを作成する座標",
          "params": {
            "x": 150,
            "y": 10
          }
        }
      ]
    }
  ]
}



```

