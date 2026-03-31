# kon-Memo

```shell
Single-User Test
Cross-User Workflow Test

//ルール
test.info() の metadata 設計
reporter 側での分類ルール






docker exec -it kd1-yjs-server sh
apt-get update && apt-get install -y procps

docker exec -it kd1-yjs-server sh -c "top"

-----LOG-------
docker logs <コンテナ名 or ID>
//リアルタイムで追いかける（tail -f 的な）
    bash
    docker logs -f <コンテナ名 or ID>

-----直近 N 行だけ（長期稼働コンテナ向け）
    bash
    docker logs --tail 100 <コンテナ名 or ID>

    時刻や経過時間で絞る例

    bash
    docker logs --since 10m <コンテナ名 or ID>   # 直近10分
    docker logs --since "2026-03-17T13:00:00" <コンテナ名 or ID>
```
ここは Playwright を本格運用するチームが必ず突き当たるポイントなので、体系的に整理しておきます。  
あなたのように **Single-User Test / Cross-User Workflow Test** を標準化するチームでは、`test.info()` のメタデータ設計と reporter 側の分類ルールは “証跡管理の中核” になります。

以下、実務で使えるレベルで **完全に理解できるように** 解説します。

---

# 🧩 **1. test.info() は何をするものか？**

Playwright の `test.info()` は、  
**「テスト実行中のメタ情報（metadata）を読み書きする API」** です。

特に重要なのは次の4つ。

---

## 🎯 **① annotations（注釈）を付けられる**
テストに任意のメタデータを付与できます。

```ts
test('作業時間が登録されること', async ({ page }, testInfo) => {
  testInfo.annotations.push({
    type: 'step',
    description: '作業時間の登録確認'
  })
})
```

### ➜ これが **レポート側で分類・検索・フィルタリング** に使える  
（あなたの “エビデンス管理サーバー” で最重要）

---

## 🎯 **② testId（一意のID）を取得できる**
外部システムに紐づけるときに便利。

```ts
console.log(testInfo.testId)
```

---

## 🎯 **③ attachments（スクショ・ログ）を追加できる**
証跡を test 単位で追加可能。

```ts
await testInfo.attach('screenshot', {
  body: await page.screenshot(),
  contentType: 'image/png'
})
```

---

## 🎯 **④ retry 回数・duration・status などの実行情報を取得できる**
レポート生成時に使える。

---

# 🧭 **まとめ：test.info() は “テストのメタデータ管理センター”**

- ステップ名  
- 機能名  
- シナリオ名  
- 役割（admin / user）  
- Single-User / Cross-User Workflow  
- エビデンスの添付  

これらを **test.info() に集約する** のがベストプラクティスです。

---

# 🗂️ **2. Reporter 側での分類ルール（何ができる？）**

Playwright の reporter は、  
**テスト結果をどのように分類・出力するかを決める仕組み** です。

分類に使える情報は次の通り。

---

# 📌 **Reporter が分類に使える情報一覧**

| 分類キー                     | 説明             | 例                               |
| ---------------------------- | ---------------- | -------------------------------- |
| **file（spec ファイル名）**  | 最も基本的な分類 | `order.single-user-test.spec.ts` |
| **test.describe の階層**     | 機能単位の分類   | `describe("作業登録")`           |
| **test 名（title）**         | ステップ名       | `"作業時間が登録されること"`     |
| **annotations（test.info）** | カスタム分類     | `feature: 作業登録`              |
| **project 名**               | ブラウザ・環境別 | `chromium`, `firefox`            |
| **status**                   | 成功/失敗/skip   | `passed`, `failed`               |
| **duration**                 | 実行時間         | 1200ms                           |
| **retry 回数**               | flaky 判定       | retry=1                          |

---

# 🧩 **3. 実務で最も使われる分類方法（あなたの用途に最適）**

あなたのチーム（20人規模・エビデンス管理サーバーあり）では、  
次の3つを組み合わせるのが最強です。

---

## ⭐ **① spec ファイル名で大分類（Single / Cross）**

```
order.single-user-test.spec.ts
approval.cross-user-workflow-test.spec.ts
```

Reporter 側で prefix を見れば分類できます。

---

## ⭐ **② describe で機能分類（Feature）**

```ts
test.describe('作業登録', () => { ... })
```

---

## ⭐ **③ test.info().annotations で “ステップ情報” を付与**

```ts
test('作業時間が登録されること', async ({ page }, testInfo) => {
  testInfo.annotations.push(
    { type: 'feature', description: '作業登録' },
    { type: 'step', description: '作業時間の登録確認' },
    { type: 'test-type', description: 'single-user-test' }
  )
})
```

### ➜ Reporter は annotations を JSON として受け取れる  
→ あなたの “エビデンス管理サイト” で分類・検索が可能になる。

---

# 🛠️ **4. カスタム Reporter での分類例（実務でよく使う）**

```ts
class MyReporter {
  onTestEnd(test, result) {
    const info = result;
    const annotations = test.annotations;

    const feature = annotations.find(a => a.type === 'feature')?.description;
    const step = annotations.find(a => a.type === 'step')?.description;
    const testType = annotations.find(a => a.type === 'test-type')?.description;

    console.log({
      file: test.location.file,
      feature,
      step,
      testType,
      status: result.status,
      duration: result.duration
    });
  }
}
```

### ➜ これを JSON にしてサーバーに送れば  
**「どのステップで失敗したか」「どの機能か」「Single/Cross か」**  
すべて分類できます。

---

# 🎯 **結論（あなたの理解は完全に正しい）**

### ✔ test.info() は “テストのメタデータ管理センター”  
### ✔ reporter は “分類・集計・出力の仕組み”  
### ✔ annotations を使うと自由度が爆上がり  
### ✔ Single-User / Cross-User Workflow の分類も簡単  
### ✔ ステップ単位のエビデンス管理に最適  

---

# 📦 次に進めるなら…

- あなたのチーム向け **metadata 設計テンプレート（英語）**  
- **spec.ts の標準テンプレート**  
- **カスタム reporter の雛形**  
- **エビデンス管理サーバー向け JSON 仕様書**  

どれでも作れます。どこから進めますか？