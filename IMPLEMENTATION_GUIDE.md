# バス停ネットワークビュー実装ガイド

## 概要
左60%地図 + 右40%マトリックス + 連動ビューの実装

## ファイル構成

### 新規作成ファイル
- **useBusNetworkStore.js** - Zustandストア（選択状態管理）
- **BusStopNetworkMap.jsx** - 左パネル（バス停放射状ネットワーク）
- **AccessibilityMatrix.jsx** - 右パネル（時間帯×目的地マトリックス）
- **buildAccessibilityMatrix.js** - データ処理ロジック
- **DataIntegration.jsx** - AreaTabとの統合ロジック
- **AreaTab_updated.jsx** - AreaTabの修正版

## 実装ステップ

### 1️⃣ Zustandストアの統合

既存の `useStore.js` に以下を追加：

```javascriptreact
import { create } from 'zustand';

export const useBusNetworkStore = create((set) => ({
  selectedRoute: null,
  selectedTimeSlot: '09-18',
  nearestBusStop: null,
  accessibleDestinations: [],
  accessibilityScore: 0,
  matrix: {},
  
  setSelectedRoute: (route) => set({ selectedRoute: route }),
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  setNearestBusStop: (stop) => set({ nearestBusStop: stop }),
  setAccessibleDestinations: (destinations) => set({ accessibleDestinations: destinations }),
  setAccessibilityScore: (score) => set({ accessibilityScore: score }),
  setMatrix: (matrix) => set({ matrix }),
  setNetworkData: (data) => set({
    nearestBusStop: data.busStop,
    accessibleDestinations: data.destinations,
    accessibilityScore: data.score,
    matrix: data.matrix,
  }),
}));
```

### 2️⃣ コンポーネントの配置

AreaTab内に以下の構造を実装：

```
AreaTab
├── showNetworkView === false
│   └── 通常ビュー（既存）
│       └── 「バス停ネットワーク」ボタン
│
└── showNetworkView === true
    ├── 左60%
    │   ├── AreaLayers
    │   └── BusStopNetworkMap
    └── 右40%
        └── AccessibilityMatrix
```

### 3️⃣ AreaTab.jsxの修正

**置き換えファイル:** `AreaTab_updated.jsx` の内容を `AreaTab.jsx` に統合

**主な変更点：**
```javascriptreact
// インポート追加
import BusStopNetworkMap from './BusStopNetworkMap';
import AccessibilityMatrix from './AccessibilityMatrix';
import { useBusNetworkStore } from './useBusNetworkStore';

// ステート追加
const [showNetworkView, setShowNetworkView] = useState(false);

// ネットワークビュー表示時のレイアウト
if (showNetworkView) {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <div style={{ width: '60%' }}>
        <AreaLayers />
        <BusStopNetworkMap />
      </div>
      <div style={{ width: '40%' }}>
        <AccessibilityMatrix />
      </div>
    </div>
  );
}
```

### 4️⃣ データ連携の実装

地区選択時にマトリックスデータを読み込む：

```javascriptreact
// AreaTab.jsx内
useEffect(() => {
  if (!areacheckcurrent) return;

  // 地区に対応したJSONファイルを読み込む
  const loadAreaData = async () => {
    try {
      // 実装例：各目的地のデータを読み込む
      const responses = await Promise.all([
        fetch(`/data/${areacheckcurrent}/chronogical_ridingtime_directtoJR西条駅.json`),
        fetch(`/data/${areacheckcurrent}/chronogical_ridingtime_directto東広島記念病院.json`),
        // その他の目的地
      ]);

      const dataArray = await Promise.all(responses.map(r => r.json()));
      const networkData = mergeMultipleRouteData({
        'JR西条駅': dataArray[0],
        '東広島記念病院': dataArray[1],
      });

      setNetworkData(networkData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  loadAreaData();
}, [areacheckcurrent]);
```

### 5️⃣ テストデータの設定

開発時の動作確認：

```javascriptreact
import { setTestNetworkData } from './DataIntegration';

// コンポーネント内
useEffect(() => {
  // テスト時のみ実行
  if (process.env.REACT_APP_USE_TEST_DATA === 'true') {
    setTestNetworkData();
  }
}, []);
```

## 連動ロジック

### 左パネル（BusStopNetworkMap）
- 放射状ネットワークの円をクリック
- `setSelectedRoute()` でストアを更新
- 右パネルに反映

### 右パネル（AccessibilityMatrix）
- マトリックスセルをクリック
- `setSelectedRoute()` でストアを更新
- 左パネルに反映

### データフロー
```
データ読み込み
  ↓
buildAccessibilityMatrix()
  ↓
useBusNetworkStore.setNetworkData()
  ↓
BusStopNetworkMap / AccessibilityMatrix 購読
  ↓
クリック時は setSelectedRoute()
  ↓
両方のコンポーネントが再レンダリング
```

## カスタマイズポイント

### 時間帯の定義
**buildAccessibilityMatrix.js**
```javascriptreact
export const classifyTimeSlot = (hour) => {
  if (hour >= 6 && hour < 9) return '06-09';    // 朝
  if (hour >= 9 && hour < 18) return '09-18';   // 昼
  if (hour >= 18 && hour < 22) return '18-22';  // 夕方
  return '22-06'; // 夜間
};
```

### アクセシビリティ判定
```javascriptreact
export const getAccessibilityIcon = (ridingTime) => {
  if (!ridingTime) return '❌';
  const minutes = ridingTime / 60;
  if (minutes <= 30) return '✅';   // 30分以内
  if (minutes <= 60) return '⚠️';   // 30-60分
  return '⚠️'; // 60分以上
};
```

### ポテンシャルスコア計算
```javascriptreact
const score = totalCells > 0 
  ? Math.round((accessibleCells / totalCells) * 100) 
  : 0;
// ✅=1, ⚠️=0.5, ❌=0 で計算
```

## 依存関係

- react
- zustand
- @mui/material
- SVG（ブラウザ標準）

## 注意点

1. **JSONファイルパス** - 環境に合わせて調整必須
2. **座標系** - バス停の緯度経度は仮値（実装時に確認）
3. **時間帯分類** - ユースケースに合わせて変更可能
4. **目的地リスト** - ハードコード化 → 動的取得に修正推奨

## 次のステップ

- [ ] 実データの連携テスト
- [ ] バス停位置の正確な座標取得
- [ ] 乗換ルートの詳細表示
- [ ] 所要時間の計算ロジック
- [ ] UIのブラッシュアップ
