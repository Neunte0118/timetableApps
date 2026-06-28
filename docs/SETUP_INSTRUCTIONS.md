# セットアップと実行ガイド

## 🚀 クイックスタート

### 1. プロジェクトの準備

```bash
# ダウンロード・解凍したディレクトリへ移動
cd timetable-react

# Node.js がインストールされていることを確認
node --version  # v16.0.0 以上
npm --version   # 8.0.0 以上
```

### 2. 依存関係のインストール

```bash
# npm で依存関係をインストール
npm install

# または yarn を使用する場合
yarn install
```

インストール時にこれらのパッケージが追加されます:
- React 18.2.0
- React DOM 18.2.0
- PapaParse 5.4.1
- Vite 5.0.0
- TypeScript 5.0.0

### 3. 開発サーバーの起動

```bash
npm run dev
```

出力:
```
  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

ブラウザが自動的に開き、`http://localhost:5173` が表示されます。

## 📁 ファイル準備

### 必須ファイル: JSON データ

`public/data/` ディレクトリに以下を配置してください:

```
public/data/
├── timetables/
│   ├── timetable_class-1.json
│   ├── timetable_class-2.json
│   ├── ... (class-9 まで)
├── events.json              # 行事予定
├── holidays.json            # 祝日データ
├── subjects_rooms_map.json  # 教室マッピング
└── expansion_map.json       # 選択科目展開
```

### 必須ファイル: HTML パーツ

`public/` に以下の HTML を配置:

```
public/
├── terms.html      # 利用規約
├── history.html    # 更新履歴
├── help.html       # ヘルプ
└── source.html     # ソース情報
```

### オプション: 画像アセット

```
public/images/
├── icon-192.png              # PWA アイコン
├── icon-512.png              # PWA アイコン大
├── moon-dark.svg             # テーマ切り替えボタン
└── sun-light.svg             # テーマ切り替えボタン
```

## 🏗️ ビルド

### 開発ビルド（ソースマップ含む）

```bash
npm run build
```

生成ファイル: `dist/` ディレクトリ

### 本番環境でのプレビュー

```bash
npm run preview
```

`dist/` の内容をローカルサーバーで確認できます。

## 🌐 デプロイ

### Vercel へのデプロイ（推奨）

```bash
# Vercel CLI をインストール
npm install -g vercel

# デプロイ実行
vercel
```

### GitHub Pages へのデプロイ

```bash
# vite.config.ts でベースパスを設定
# base: '/timetable-react/' // リポジトリ名に合わせる

npm run build
```

`dist/` の内容を GitHub Pages へプッシュ。

### Docker でのデプロイ

```dockerfile
# Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build -t timetable-app .
docker run -p 80:80 timetable-app
```

### AWS S3 + CloudFront へのデプロイ

```bash
# AWS CLI をインストール
npm install -g aws-cli

# ビルド
npm run build

# S3 へアップロード
aws s3 sync dist/ s3://your-bucket-name

# CloudFront キャッシュ無効化
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

## 🔍 トラブルシューティング

### エラー: "Cannot find module"

```bash
# キャッシュをクリア
rm -rf node_modules/.vite

# 再インストール
npm install

# 再起動
npm run dev
```

### エラー: "PORT 5173 already in use"

```bash
# 別のポート指定
vite --port 3000

# または別のプロセスを終了
# macOS/Linux
lsof -i :5173
kill -9 <PID>

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### エラー: "IndexedDB not working"

```javascript
// デバッガで確認
// Chrome DevTools → Application → Storage → IndexedDB → TimetableDB

// Incognito/Private mode では制限あり
// → 通常ウィンドウで試す
```

### エラー: "TypeScript compilation errors"

```bash
# 型チェック実行
npm run type-check

# エラー位置を確認
# すべてを修正してから npm run dev
```

## 📊 本番環境チェックリスト

```
□ npm run type-check パス
□ npm run build パス
□ dist/ の確認
  □ index.html が存在
  □ assets/ に JS/CSS が存在
  □ data/ に JSON が存在
□ public/ に静的ファイルが含まれている
  □ images/ に画像
  □ manifest.json
  □ HTML パーツ
□ ブラウザでテスト
  □ 時間割が表示される
  □ テーマ切り替えが動作
  □ メモが保存される
  □ IndexedDB に データが保存される
□ Google Analytics が動作している
□ PWA がインストール可能
```

## 🔐 セキュリティ設定

### Content Security Policy (CSP)

```html
<!-- index.html の head に追加 -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://docs.google.com https://www.googletagmanager.com;
" />
```

### 認証が不要なため：

- ✅ localStorage のみで十分
- ✅ IndexedDB の暗号化は不要
- ✅ HTTPS は推奨（PWA の場合は必須）

## 📈 パフォーマンス最適化

### 1. キャッシング

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
        }
      }
    }
  }
})
```

### 2. 画像最適化

```bash
# WebP 形式に変換
ffmpeg -i icon-192.png -c:v libwebp icon-192.webp
```

### 3. バンドル分析

```bash
npm install --save-dev rollup-plugin-visualizer
```

## 📝 環境変数

`.env.local` を作成（`.env.example` を参照）:

```env
VITE_GA_ID=G-4089Q2JD7J
VITE_DEBUG=false
```

## 🚨 重要な注意点

### 1. データの永続性

- **localStorage**: ブラウザキャッシュクリアで削除
- **IndexedDB**: 同様にクリアで削除
- → 重要データはクラウド連携推奨

### 2. CORS 制限

Google Sheets からのデータ取得が CORS 制限の影響を受ける可能性。
本番環境でプロキシ設定が必要な場合がある。

### 3. オフライン対応

Service Worker は含まれていません。
オフライン対応が必要な場合は別途実装が必要。

## 📞 サポートリソース

### ドキュメント

- [React 公式](https://react.dev)
- [TypeScript ハンドブック](https://www.typescriptlang.org/docs/)
- [Vite ドキュメント](https://vitejs.dev)

### トラブル時

1. ブラウザコンソール でエラーを確認
2. `npm run type-check` で型エラーを確認
3. `npm run dev` をクリアな状態で再実行

## ✅ セットアップ確認リスト

```bash
# 1. インストール確認
npm --version
node --version

# 2. 依存関係確認
npm list react react-dom vite typescript

# 3. 開発サーバー起動
npm run dev
# ブラウザで http://localhost:5173 にアクセス

# 4. ビルド確認
npm run build

# 5. 型チェック確認
npm run type-check
```

すべてパスしたら、デプロイ準備完了です！

---

**最終確認日**: 2026-04-27  
**バージョン**: 2.0.0
