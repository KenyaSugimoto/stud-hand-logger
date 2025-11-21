# 📘 Stud Hand Logger
### *Seven Card Stud / Razz / Stud Hi-Lo 用ハンド記録アプリ*

ブラウザ上で動く **Stud 系ゲーム専用のハンド記録アプリ**です。
スマホでのリアルタイム入力を想定し、カード入力やアクション入力をできるだけ直感的・高速に行えるように設計されています。

URL: https://stud-hand-logger.vercel.app

---

## 🚀 主な特徴

### ✔ 3種類の Stud ゲームに対応
- **Seven Card Stud (StudHi)**
- **Seven Card Stud Hi-Lo 8 or Better (Stud8)**
- **Razz**

---

### ✔ スマホ完全対応（モバイル UI 最適化）
- ワンタップでカード選択
- スロット式で 3rd〜7th のカードを配置
- bring-in や complete など Stud 固有アクションも選択式

---

### ✔ アクション履歴の自動処理
- `fold` → 自動的に alive=false
- `bri`（bring-in）→ bring-in プレイヤーとして記録
- ストリート終了条件を満たすと **自動で next street に遷移**
  → （ロジックは Zustand ストア内で管理）

---

### ✔ Stud 形式のハンド履歴を自動生成
- 3rd〜7th のカードを Stud 流儀で整形
- **7th はスラッシュ `/` の右側に表示**
- fold 済みプレイヤーは以降のストリートでは非表示

---

### ✔ 操作ミスにも強い
- 直前のアクション取り消し
- ストリート単位でのリセット
- プレイヤー数変更（2〜8人）

---

## 🧩 画面イメージ（概要）

- ゲームタイプ選択
- プレイヤー数設定（2〜8人）
- カード入力画面（Mobile UI）
- アクション入力画面
- 履歴プレビュー表示

---

## 🛠 技術スタック

| 項目 | 使用技術 |
|------|-----------|
| ライブラリ | React + TypeScript |
| 状態管理 | Zustand |
| スタイリング | Tailwind CSS |
| ビルド / Dev | Vite |
| デプロイ | Vercel |

