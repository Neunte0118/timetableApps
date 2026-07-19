# 時間割アプリ - React + TypeScript 版

既存のHTML/CSS/JavaScriptアプリケーションをVite + React + TypeScriptに移植したプロジェクトです。

## 📋 移植内容

### 主な変更点

| 項目 | 旧版 | 新版 |
|------|------|------|
| フレームワーク | バニラJS | React 18 |
| 言語 | JavaScript | TypeScript (strict mode) |
| ビルドツール | なし | Vite |
| 状態管理 | グローバル変数 | React Context + Hooks |
| DOM操作 | 直接操作 | 宣言的（React） |

### 主要機能の保持

✅ 時間割表示（複数クラス対応）
✅ 日付ナビゲーション
✅ イベント・メモ表示（IndexedDB永続化）
✅ 移動教室表示切り替え
✅ フィルター機能
✅ テーマ切り替え（ライト/ダーク）
✅ 選択科目設定
✅ クラス設定
✅ レスポンシブ対応

## 🚀 セットアップ

### 前提条件

- Node.js 16+ (推奨: 18.x LTS)
- npm 8.x 以上

### インストール

```bash
# プロジェクトディレクトリへ移動
cd timetable-react

# 依存関係をインストール
npm install

# 必要な Vite React プラグインを追加
npm install --save-dev @vitejs/plugin-react
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで自動的に `http://localhost:5173` が開きます。

### ビルド

```bash
npm run build
```

本番用の最適化されたバンドルが `dist/` ディレクトリに生成されます。

### 型チェック

```bash
npm run type-check
```

## 📁 ファイル構成

```
src/
├── App.tsx                           # メインアプリケーション
├── main.tsx                          # Reactエントリーポイント
├── index.css                         # グローバルスタイル
├── components/
│   ├── TimeTable.tsx                 # 時間割表表示
│   ├── DateNavigator.tsx             # 日付選択・ナビゲーション
│   ├── EventMemoBox.tsx              # イベント・メモ表示
│   ├── Modal.tsx                     # モーダルダイアログ
│   ├── Toolbar.tsx                   # 上部ツールバー
│   └── ...
├── hooks/
│   ├── useStorage.ts                 # localStorage管理
│   ├── useDatabase.ts                # IndexedDB管理
│   ├── useTheme.ts                   # テーマ管理
│   └── useModal.ts                   # モーダル管理
├── contexts/
│   └── AppContext.tsx                # グローバルアプリケーション状態
├── services/
│   ├── storageService.ts             # localStorage抽象化
│   ├── dbService.ts                  # IndexedDB抽象化
│   └── dataService.ts                # JSONデータ取得・処理
├── types/
│   └── index.ts                      # TypeScript型定義
└── utils/
    ├── formatting.ts                 # 日付・テキストフォーマット
    └── constants.ts                  # アプリケーション定数

public/
├── data/
│   ├── timetables/                   # 時間割JSONファイル
│   ├── events.json                   # 行事予定
│   ├── holidays.json                 # 祝日データ
│   ├── subjects_rooms_map.json       # 教室マッピング
│   └── expansion_map.json            # 選択科目展開マップ
├── images/                           # アイコン・画像
├── manifest.json                     # PWA設定
└── ...html                           # モーダルコンテンツ

vite.config.ts                        # Vite設定
tsconfig.json                         # TypeScript設定
package.json                          # 依存関係定義
index.html                            # HTMLエントリーポイント
```

## 🏗️ アーキテクチャ

### 状態管理フロー

```
AppContext (全体状態)
    ↓
    ├── hooks (useAppContext で取得)
    ├── components (状態に応じてレンダリング)
    └── services (データ取得・永続化)
```

### データフロー

1. **初期化**
   - App.tsx が起動時に基本データを読み込む
   - localStorage から設定を復元
   - IndexedDB からメモを読み込み

2. **リアルタイム更新**
   - useAppContext で状態を取得
   - 状態変化でコンポーネント自動再レンダリング
   - 永続化は services 層が処理

3. **外部データ**
   - Google Sheets から イベント・時間割変更を非同期取得
   - PapaParse で CSV を JSON に変換

## 🔧 主要な改善点

### 1. 型安全性

```typescript
// 旧版：型チェックなし
let classNumber = null;

// 新版：完全な型定義
const classNumber: number | null = null;
```

### 2. 状態管理の簡潔化

```typescript
// 旧版：複数のグローバル変数
let timetableData = {};
let events = {};
let selectedDate = new Date();
// ...20+ 個のグローバル変数

// 新版：Context で一元管理
const { timetableData, events, selectedDate } = useAppContext();
```

### 3. 再利用可能なフック

```typescript
// 任意のコンポーネントで簡単に使用可能
const { saveMemo, loadMemo } = useDatabase();
const [theme, setTheme] = useStorage('theme', 'light');
```

### 4. 自動コンポーネント最適化

React の Virtual DOM が自動的に必要な箇所のみ再レンダリング。
古いコードの手動 DOM 操作の複雑さが解消。

## 📦 依存関係

### 必須

- **react** ^18.2.0 - UI フレームワーク
- **react-dom** ^18.2.0 - DOM レンダリング
- **papaparse** ^5.4.1 - CSV 解析（既存のまま）

### 開発環境

- **vite** ^5.0.0 - ビルドツール
- **typescript** ^5.0.0 - 型チェック
- **@vitejs/plugin-react** ^4.0.0 - React プラグイン

## 🎯 今後の拡張候補

1. **状態永続化の改善**
   - Redux Persist の導入で さらに複雑な状態に対応

2. **コンポーネント分割**
   - ClassSetupModal, SubjectsSetupModal を独立コンポーネント化

3. **テスト**
   - Vitest + React Testing Library を導入

4. **パフォーマンス最適化**
   - React.memo, useMemo による最適化
   - コード分割（Code Splitting）

5. **PWA 完全化**
   - Service Worker の TypeScript 化
   - オフライン機能の拡張

## 🔄 既存データの移行

古いアプリから新しいアプリへのデータ移行：

1. **localStorage**: 自動的に読み込み（キー互換性を維持）
2. **IndexedDB**: データベース名 `TimetableDB` は同じ
3. **JSON ファイル**: `public/data/` に配置

## ⚠️ 注意点

### アセット配置

```
public/
├── data/
│   ├── timetables/
│   │   ├── timetable_class-1.json
│   │   ├── timetable_class-2.json
│   │   └── ...
│   ├── events.json
│   └── ...
└── images/
```

Vite では `public/` フォルダ内のファイルは `/` から アクセス可能です。

### TypeScript strict mode

すべてのファイルで strict mode が有効です。
型エラーはビルド時にエラーになります。

```bash
# 型チェックのみ（ビルドなし）
npm run type-check
```

## 🐛 トラブルシューティング

### "Cannot find module '@/components/TimeTable'"

```bash
# キャッシュをクリアして再起動
rm -rf node_modules/.vite
npm run dev
```

### IndexedDB が動作しない

開発者ツール → Application → Storage → IndexedDB を確認。
Incognito/Private モードでは制限されます。

### 日本語フォント表示

Google Fonts の Noto Serif JP が必要です。
index.html の `<head>` で指定されています。

## 📞 サポート

問題が発生した場合：

1. ブラウザコンソール で エラーメッセージを確認
2. `npm run type-check` で型エラーを確認
3. Network タブで API 呼び出しを確認

---

**バージョン**: 2.0.0  
**作成日**: 2026/04/27
