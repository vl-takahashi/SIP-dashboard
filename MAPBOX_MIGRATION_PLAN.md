# Mapbox GL JS 移行計画

## 実装状況

### 完了した修正
- ✅ DeckGL インポートを削除、Mapbox GL JS に置き換え
- ✅ mapRef, mapInstance 状態管理を追加
- ✅ Map コンポーネントに置き換え（react-map-gl）
- ✅ handleMapLoad, useEffect でレイヤー初期化処理を実装
- ✅ Mapboxレイヤー変換関数の基本構造を実装

### 未実装（次段階）

#### 段階1：基本機能実装
1. **GeoJsonレイヤーの色計算ロジック**
   - 現在：簡素な固定色
   - 必要：複雑な条件分岐と計算式
   - 実装方法：Mapboxの `getFillColor()` をデータプロパティベースの計算に変換

2. **イベントハンドラーの完全実装**
   - クリック処理：Zustand ストア（setClickpopmesh, setClickneareststop等）に連携
   - ホバー処理：既存のautoHighlight機能を実装

3. **レイヤー表示/非表示制御**
   - 動的なvisibility更新（updateTriggers に対応）
   - layercheck, kind 等の状態に応じた表示/非表示

#### 段階2：複雑なロジック対応
1. TextLayer（テキストラベル）の完全な移行
2. IconLayer（バス停マーカー）のカスタムマーカー実装
3. 複数レイヤーの条件付き表示（複数レイヤー表示モード）

#### 段階3：パフォーマンス最適化
1. レイヤーキャッシング
2. GeoJsonフィルタリングの最適化
3. updateTriggers の効率的な実装

---

## 実装の重要ポイント

### 1. Mapbox Paint Properties の使用
Mapboxでは、フィーチャープロパティに基づいて色を計算できます：

```javascript
// Deck.gl（古い方式）
getFillColor: (d) => {
  const ratio = d.properties["ridingtime"] / 10;
  return [255-ratio, 255, ratio, 200];
}

// Mapbox（新しい方式）
paint: {
  'fill-color': [
    'case',
    ['has', 'ridingtime'],
    [
      'interpolate',
      ['linear'],
      ['get', 'ridingtime'],
      60, 'rgb(100, 150, 200)',
      600, 'rgb(255, 100, 100)'
    ],
    'rgba(200, 200, 200, 0)'
  ]
}
```

### 2. イベント処理の統合
現在の実装：map.on('click', layerId, callback)
Zustandストア連携が必要：

```javascript
handleMapLayerClick = (e, layerId) => {
  const feature = e.features[0];
  
  // レイヤーIDに基づいて適切なストア関数を呼び出し
  if (layerId.includes('popmesh')) {
    setClickpopmesh(feature.properties.PT00_2025);
  } else if (layerId.includes('stop')) {
    setClickstop(feature.properties.name);
  }
  // ... その他
}
```

### 3. レイヤー可視性の動的制御
```javascript
// Mapboxでレイヤーの可視性を更新
useEffect(() => {
  if (mapInstance && layers) {
    mapInstance.setLayoutProperty(
      'layer-id',
      'visibility',
      shouldShowLayer ? 'visible' : 'none'
    );
  }
}, [mapInstance, kind, layercheck]);
```

---

## 推奨される次のステップ

### ステップ1：简单なGeoJsonレイヤーから開始
- popmesh（居住地メッシュ）
- facility（施設）
- road（道路）

### ステップ2：複雑なレイヤーに進む
- ridingtime_direct（所要時間レイヤー）
- ridingtime_transit（乗り換えレイヤー）

### ステップ3：シンボルレイヤーに対応
- TextLayer をSymbolレイヤーに変換
- IconLayer をSymbolレイヤーに変換

### ステップ4：全体テストとデバッグ
- すべてのレイヤーが表示されることを確認
- クリック・ホバーが正しく機能することを確認
- パフォーマンスをテスト

---

## 技術的注意点

### Deck.gl vs Mapbox GL JS の違い

| 項目 | Deck.gl | Mapbox GL JS |
|------|---------|-------------|
| レイヤー型 | Layer クラス | source + layer |
| イベント | Layer.onClick等 | map.on('click') |
| スタイル | props で動的 | paint/layout で静的 |
| フィーチャープロパティ | 自由 | GeoJSON properties |
| パフォーマンス | WebGL | WebGL |

### 既存データ構造の活用
- GeoJSON データ：そのまま使用可能
- Layer ID：Mapbox layer ID として使用
- Paint properties：計算関数の結果を適用

---

## ファイル修正リスト

### 完了
- ✅ src/components/AreaRenderLayers.jsx（インポート、基本構造）
- ✅ package.json（確認のみ）

### 次回修正予定
- src/components/AreaRenderLayers.jsx（イベント処理、色計算）
- src/components/AccessibilityRenderLayers.jsx（同様の移行）
- 他のレンダーコンポーネント

