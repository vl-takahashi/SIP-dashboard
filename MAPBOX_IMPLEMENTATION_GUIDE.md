# Mapbox GL JS 実装ガイド

## 現状報告

### ✅ 完了した実装

#### 1. インポート修正
```javascript
// 旧：DeckGL関連
import { DeckGL } from '@deck.gl/react';
import { GeoJsonLayer, TextLayer, IconLayer } from '@deck.gl/layers';

// 新：Mapbox GL JS
import { Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map from 'react-map-gl/mapbox';
```

#### 2. マップ参照とインスタンス管理
```javascript
const mapRef = useRef(null);
const [mapInstance, setMapInstance] = useState(null);
const [viewState, setViewState] = useState(null);
```

#### 3. Mapコンポーネント置き換え
```javascript
// DeckGLコンポーネント削除
// 代わりにreact-map-glのMapコンポーネントを使用
<Map
  ref={mapRef}
  mapboxAccessToken={mapboxAccessToken}
  mapStyle={mapstyle}
  initialViewState={viewAccessibility}
  onClick={...}
  onLoad={handleMapLoad}
  onMove={...}
/>
```

#### 4. レイヤー初期化処理
```javascript
const handleMapLoad = useCallback((map) => {
  setMapInstance(map);
}, []);

useEffect(() => {
  if (!mapInstance) return;
  // レイヤー追加・更新処理
}, [mapInstance, mapboxLayerConfigs, hover]);
```

#### 5. イベントハンドラー実装
```javascript
// クリック処理
const handleMapLayerClick = (e, layerId) => {
  const feature = e.features?.[0];
  // Zustandストアを更新
  setClickpopmesh(...);
  setClickstop(...);
  // など
};

// ホバー処理
mapInstance.on('mouseenter', layerId, () => {
  mapInstance.getCanvas().style.cursor = 'pointer';
});
```

#### 6. Mapboxレイヤー変換関数
```javascript
const convertDeckglLayersToMapboxLayers = (deckglLayers) => {
  // GeoJsonレイヤー → Mapboxレイヤーに変換
  // source と layer 設定を生成
};
```

---

## 次のステップ（段階的実装）

### ステップ1：簡単なレイヤーから開始 ⏱️ 推定30分

#### 対象レイヤー
1. **popmesh（居住地メッシュ）**
   - 行951-985
   - 色計算：pop値によるグラデーション

2. **facility（施設）**
   - 行892-916
   - シンプルな赤い円形

3. **road（道路）**
   - 行918-941
   - シンプルな赤いラインレイヤー

#### 実装方法
```javascript
// Mapboxレイヤースタイル例（popmesh）
{
  type: 'fill',
  id: 'layer-popmesh-...',
  source: 'source-popmesh-...',
  paint: {
    'fill-color': [
      'case',
      ['has', pop],
      [
        'interpolate',
        ['linear'],
        ['get', pop],
        0, 'rgba(255, 255, 255, 0.1)',
        100, 'rgba(255, 200, 0, 0.5)',
        500, 'rgba(255, 100, 0, 0.7)'
      ],
      'rgba(200, 200, 200, 0.3)'
    ]
  }
}
```

### ステップ2：複雑なレイヤー ⏱️ 推定1-2時間

#### 対象レイヤー
1. **ridingtime_direct（直行所要時間）**
   - 行1030-1212
   - 複雑な色計算
   - 条件付き表示

2. **ridingtime_transit（乗り換え所要時間）**
   - 行1262-1746
   - 複数のサブレイヤー（直行、乗り換え前後）

#### 実装のポイント
```javascript
// 色計算の例
const ratio = Math.min(ridingtime / 600, 1); // 0-600分を0-1に正規化
const r = Math.floor(81 - (ratio * 77));   // 81 → 4
const g = Math.floor(170 - (ratio * 133)); // 170 → 37
const b = Math.floor(238 - (ratio * 108)); // 238 → 130

// Mapboxでの実装
'fill-color': [
  'case',
  ['>=', ['get', 'ridingtime'], 60],
  [
    'interpolate',
    ['linear'],
    ['get', 'ridingtime'],
    60, 'rgb(81, 170, 238)',   // 短い
    600, 'rgb(4, 37, 130)'     // 長い
  ],
  'rgba(0, 0, 0, 0)' // 条件外は透明
]
```

### ステップ3：シンボルレイヤー ⏱️ 推定1時間

#### 対象レイヤー
1. **TextLayer（テキストラベル）**
   - 行332-348, 730-746など
   - バス停名などのテキスト表示

2. **IconLayer（アイコンマーカー）**
   - 行309-328, 706-725など
   - バス停マーカー

#### 実装例
```javascript
// TextLayer → Symbolレイヤー
{
  type: 'symbol',
  id: 'layer-text-...',
  source: 'source-text-...',
  layout: {
    'text-field': ['get', 'name'],
    'text-font': ['Open Sans Semibold'],
    'text-size': 12,
    'text-anchor': 'bottom',
    'text-offset': [0, -2]
  },
  paint: {
    'text-color': 'rgb(1, 0, 102)'
  }
}

// IconLayer → Symbolレイヤー（カスタムマーカー）
{
  type: 'symbol',
  id: 'layer-icon-...',
  source: 'source-icon-...',
  layout: {
    'icon-image': 'marker', // Mapboxのデフォルトマーカー
    'icon-size': 1.5,
    'icon-allow-overlap': true
  }
}
```

---

## 重要な注意点

### 1. GeoJSONデータの準備
MapboxではデータをGeoJSON形式で管理：
```javascript
const source = {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          ridingtime: 120,
          PT00_2025: 500,
          name: 'バス停A'
        },
        geometry: {
          type: 'Point',
          coordinates: [132.456, 34.123]
        }
      }
    ]
  }
};
```

### 2. 動的スタイル更新
Mapboxではスタイルを動的に変更可能：
```javascript
// 表示/非表示
mapInstance.setLayoutProperty('layer-id', 'visibility', 'visible' | 'none');

// 色を変更
mapInstance.setPaintProperty('layer-id', 'fill-color', 'rgb(255, 0, 0)');

// opacity を変更
mapInstance.setPaintProperty('layer-id', 'fill-opacity', 0.5);
```

### 3. パフォーマンス最適化
```javascript
// レイヤー数を減らす（複数レイヤーを1つに統合）
// フィーチャー数を減らす（不要なフィーチャーをフィルタ）
// GeoJSONファイルサイズを最小化
```

---

## テストチェックリスト

### 基本機能
- [ ] 地図が表示される
- [ ] 地図をドラッグ・ズームできる
- [ ] レイヤーが表示される

### ポップアップ・インタラクション
- [ ] レイヤーをクリックするとストアが更新される
- [ ] ホバー時にカーソルが pointer に変わる
- [ ] 複数レイヤーが同時に表示される

### 表示制御
- [ ] layercheck 値に応じてレイヤーが表示/非表示になる
- [ ] kind 値に応じて色が変わる
- [ ] pop 値に応じて色がグラデーションする

### パフォーマンス
- [ ] 地図のパンが滑らか
- [ ] ズーム時にレイヤーが遅延しない
- [ ] 複数レイヤー表示時でもフレームドロップがない

---

## トラブルシューティング

### レイヤーが表示されない
```javascript
// 確認項目
1. sourceが正しく追加されているか
   mapInstance.getSource('source-id') !== undefined

2. layerが正しく追加されているか
   mapInstance.getLayer('layer-id') !== undefined

3. データが正しいGeoJSON形式か
   console.log(source.data);

4. visibility が 'visible' になっているか
   mapInstance.getLayoutProperty('layer-id', 'visibility');
```

### イベントが発火しない
```javascript
// 確認項目
1. pickableが有効になっているか（Deck.gl風）
   → Mapboxではデフォルトで有効

2. クリックハンドラーが登録されているか
   mapInstance.on('click', 'layer-id', callback);

3. 対象レイヤーがクリッカブル型か
   (fill, line, symbol レイヤーのみクリック可能)
```

### パフォーマンスが低下
```javascript
// 改善方法
1. レイヤー数を減らす
2. フィーチャー数を減らす
3. ズームレベルに応じてデータをフィルタ
4. 大きなGeoJSONを分割
```

---

## ファイル修正状況

| ファイル | 状態 | 完成度 |
|---------|------|--------|
| AreaRenderLayers.jsx | ✏️ 進行中 | 40% |
| AccessibilityRenderLayers.jsx | ⏳ 未開始 | 0% |
| DemandRenderLayers.jsx | ⏳ 未開始 | 0% |
| その他レンダーレイヤー | ⏳ 未開始 | 0% |

---

## 推奨される実装スケジュール

**フェーズ1：基本レイヤー（1日）**
- popmesh, facility, road の移行
- イベントハンドラー確認

**フェーズ2：複雑レイヤー（2-3日）**
- ridingtime_direct/transit の移行
- 色計算ロジックの完全実装

**フェーズ3：シンボルレイヤー（1-2日）**
- TextLayer, IconLayer の移行
- マーカー表示確認

**フェーズ4：全体テスト（1日）**
- 統合テスト
- パフォーマンステスト
- バグ修正

**総計：5-7日**

