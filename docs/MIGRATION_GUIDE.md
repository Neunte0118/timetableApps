# 移植ガイド - バニラJS → React + TypeScript

## 概要

このガイドは、既存のバニラJSアプリケーションがどのようにReactに移植されたかを説明します。

## 主要な設計パターン

### 1. グローバル変数 → Context API

**旧版（バニラJS）**
```javascript
// app-old.js
let db;
let currentColumnIndex = 0;
let baseDate = new Date();
let events = {};
let timetableData = {};
let currentTheme = 'dark';
// ... 多数のグローバル変数
```

**新版（React）**
```typescript
// src/contexts/AppContext.tsx
export const AppProvider: React.FC = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [classNumber, setClassNumber] = useState<number | null>(null);
  const [timetableData, setTimetableData] = useState({});
  // ...
  
  return (
    <AppContext.Provider value={{ theme, setTheme, classNumber, ... }}>
      {children}
    </AppContext.Provider>
  );
};
```

**利点**
- ❌ グローバル汚染なし
- ✅ 明示的な依存関係
- ✅ テスト可能性向上
- ✅ デバッグが容易

### 2. イベントリスナー → React イベントハンドラ

**旧版**
```javascript
document.getElementById("prev-btn").addEventListener("click", () => {      
  const prevDate = new Date(baseDate);
  prevDate.setDate(prevDate.getDate() - 1);
  showDate(prevDate);
  updateTable();
});

document.getElementById("next-btn").addEventListener("click", () => {        
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + 1);
  showDate(nextDate);
  updateTable();
});
```

**新版**
```typescript
// src/components/DateNavigator.tsx
export const DateNavigator: React.FC = () => {
  const { selectedDate, setSelectedDate } = useAppContext();

  const handlePrev = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);  // 自動再レンダリング
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);  // 自動再レンダリング
  };

  return (
    <button onClick={handlePrev}>前へ</button>
    <button onClick={handleNext}>次へ</button>
  );
};
```

**利点**
- ✅ 自動的なメモリ管理（リスナー削除不要）
- ✅ JSXで直感的に記述
- ✅ コンポーネント固有のスコープ

### 3. DOM 直接操作 → 宣言的レンダリング

**旧版**
```javascript
function generateDates() {
  for (let i = 0; i < dateCells.length; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    
    dateCells[i].textContent = formatCellDate(date);
    applyHeaderClasses(dateCells[i], date);
  }
}

function applyHeaderClasses(cell, date) {
  cell.classList.remove("today", "not-today", "saturday", "holiday");
  
  if (isToday(date)) {
    cell.classList.add("today");
  }
  // ... さらに複雑なロジック
}
```

**新版**
```typescript
// src/components/TimeTable.tsx
const renderDateHeader = (date: Date) => {
  const classes = ['date-cell'];
  if (isToday(date, today)) classes.push('today');
  if (isSaturday(date)) classes.push('saturday');
  if (isHoliday(date, holidays)) classes.push('holiday');

  return (
    <th key={formatCellDate(date)} className={classes.join(' ')}>
      {formatCellDate(date)}
    </th>
  );
};

// JSX でリスト化
return (
  <thead>
    <tr>
      {dates.map(renderDateHeader)}
    </tr>
  </thead>
);
```

**利点**
- ✅ 宣言的 → 意図が明確
- ✅ 条件分岐が見やすい
- ✅ 再利用可能

### 4. 複雑な関数 → コンポーネント分割

**旧版**
```javascript
// app-old.js - 約2000行の単一ファイル
// - 時間割表示
// - 日付操作
// - イベント表示
// - メモ保存
// - モーダル管理
// ... すべてが混在
```

**新版**
```typescript
// コンポーネント単位で分割
App.tsx                    // メインロジック
  ├── TimeTable.tsx        // 時間割表示
  ├── DateNavigator.tsx    // 日付操作
  ├── EventMemoBox.tsx     // イベント・メモ
  ├── Modal.tsx            // モーダル
  └── Toolbar.tsx          // ツールバー
```

**利点**
- ✅ 単一責任原則
- ✅ テスト容易性
- ✅ 保守性向上

### 5. IndexedDB → カスタムフック化

**旧版**
```javascript
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("TimetableDB", 2);
    request.onupgradeneeded = event => { /* ... */ };
    request.onsuccess = event => { /* ... */ };
    request.onerror = () => { /* ... */ };
  });
}

function saveMemo(date, text) {
  ensureDbReady().then(() => {
    const tx = db.transaction("memos", "readwrite");
    const store = tx.objectStore("memos");
    store.put({ date, text });
  });
}
```

**新版**
```typescript
// src/services/dbService.ts - 詳細を隠蔽
export const dbService = {
  async saveMemo(date: string, text: string): Promise<void> {
    const db = await getDb();
    const tx = db.transaction('memos', 'readwrite');
    tx.objectStore('memos').put({ date, text });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
};

// src/hooks/useDatabase.ts - React フック化
export function useDatabase() {
  const saveMemo = useCallback(
    async (date: string, text: string) => {
      await dbService.saveMemo(date, text);
    },
    []
  );
  
  return { saveMemo };
}

// 使用時
const { saveMemo } = useDatabase();
saveMemo(date, text);  // シンプル！
```

**利点**
- ✅ 詳細が隠蔽（APIがシンプル）
- ✅ エラーハンドリングが一元化
- ✅ コンポーネント内で簡潔に使用

## ファイル対応表

| 旧版ファイル | 対応する新版ファイル | 説明 |
|-------------|-------------------|------|
| app-old.js | App.tsx + hooks | メインロジック分散 |
| script.js | main.tsx | エントリーポイント |
| modules/net.js | services/dataService.ts | データ取得 |
| modules/storage.js | services/storageService.ts | localStorage抽象化 |
| modules/db.js | services/dbService.ts | IndexedDB抽象化 |
| modules/modal.js | components/Modal.tsx | モーダル表示 |
| modules/theme.js | hooks/useTheme.ts | テーマ管理 |
| style.css | src/index.css | CSS統合 |

## パフォーマンスの最適化

### 1. React.memo での不要な再レンダリング防止

```typescript
// TimeTable コンポーネントが頻繁に更新されない場合
export const TimeTable = React.memo(({ isSplit }: TimeTableProps) => {
  // ...
});
```

### 2. useMemo でコンポーネント内の計算結果をキャッシュ

```typescript
const dates = useMemo(() => {
  const result = [];
  for (let i = 0; i < days; i++) {
    // ... 計算
  }
  return result;
}, [selectedDate, startDay]);
```

### 3. useCallback でイベントハンドラをメモ化

```typescript
const handleSave = useCallback(async () => {
  // ...
}, [classNumber]); // 依存関係を明示
```

## デバッグのコツ

### React DevTools の活用

```bash
# Chrome 拡張機能をインストール
# "React Developer Tools" をChrome ウェブストアから追加
```

### コンポーネントツリーの確認

ブラウザ DevTools → "Components" タブで、
- コンポーネント階層を確認
- 各コンポーネントの state・props を確認
- 不要な再レンダリングを検出

### 型エラーの確認

```bash
npm run type-check
```

TypeScript の static 解析で、ビルド前にエラーを発見。

## 移行チェックリスト

✅ TypeScript strict mode で完全な型安全性
✅ Context API で状態管理一元化
✅ カスタムフック化で再利用性向上
✅ コンポーネント分割で保守性向上
✅ サービス層の分離で テスト容易性向上
✅ CSS スコープ管理（グローバルCSS）
✅ PWA 対応（manifest.json）
✅ GitHub Actions での CI/CD 対応可能
✅ Vitest での単体テスト実装可能
✅ Storybook での UI 開発環境構築可能

## よくある質問

### Q: なぜ Redux を使わないのか？

A: Context API で十分な規模です。Redux が必要になったら容易に追加可能です。

### Q: データ永続化の方法は？

A: localStorage（設定）+ IndexedDB（メモ）で旧版と互換。
今後 IndexedDB の API を統一して改善可能。

### Q: 既存の HTML/JS をそのまま使えるか？

A: いいえ。React は Virtual DOM を使うため、直接 DOM 操作は推奨されません。
すべてをコンポーネント化する必要があります。

### Q: TypeScript の学習曲線は？

A: 初心者には steep ですが、大規模プロジェクトでは時間短縮につながります。
公式ドキュメント + IDE の補完を活用すると、すぐに慣れます。

---

**参考資料**
- React 公式ドキュメント: https://react.dev
- TypeScript ハンドブック: https://www.typescriptlang.org/docs/
- Vite ドキュメント: https://vitejs.dev
