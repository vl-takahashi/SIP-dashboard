# 状態管理 設計方針ドキュメント

対象：ダッシュボードアプリ（React / Zustand）
目的：ロジックと変数の「置き場」を明確化し、今後の機能追加で再び重複・肥大化させないためのルールを定める。

基本機能は実装済みのため、本ドキュメントは**設計方針のみ**を定めるもの。コードの変更は含まない。実際のリファクタは、本方針に沿って着手範囲を決めたうえで別途行う。

---

## 1. 状態の3分類基準

新しい変数を追加するときは、まずこの3つの問いに順番に答える。

| 問い | Yesの場合の置き場 |
|---|---|
| ① 2つ以上のタブ／コンポーネントで共有するか？<br>② タブ切替後も値を保持したいか？<br>③ 地図レイヤーの表示に直接影響するか？ | **Global（Zustandストア）** |
| 上記に当たらず、そのコンポーネントが消えたら消えてよい値か？（ポップアップ開閉、入力中の値など） | **Local（useState）** |
| 他のstateから計算できる値か？ | **Derived（store化しない。useMemoやセレクタで都度算出）** |

判断に迷う場合は「Localで様子を見て、後から共有が必要になったらGlobalへ引き上げる」を基本方針とする（先にGlobal化しすぎない）。

### Globalストアを新規作成する前のチェック

新しいZustand storeを作る前に、必ず既存storeファイル（下記フォルダ構成参照）の中に意味の近いものがないか確認する。「似た値ごとに新規storeを作る」運用が、現状29個のストアと使い回しの効かない16個の"クリック情報系ストア"を生んだ主因のため、**新規store作成は原則禁止・既存ドメインへの追加を優先**する。

---

## 2. 推奨フォルダ構成

```
src/
  store/
    dataStore.js         // データ本体（useDataStore）
    uiStore.js           // 表示制御（レイヤー切替・ホバー・バーチャート・タイムスライダー等）
    viewStore.js         // 地図カメラ位置（タブ別に分けず1本化）
    selectionStore.js    // 属性選択（種別・曜日・エリア・住所・目的地）
    clickInfoStore.js    // 地物クリック情報（メッシュ/エリア/施設/停留所など）
  hooks/
    useTabFilterState.js // タブ内の絞り込み系stateをまとめるカスタムフック
    useActiveTab.js       // アクティブタブ管理（派生値でトグル状態を出す）
  utils/
    geojsonMerge.js       // GeoJSONマージ等、store内に書かれていたロジックの分離先
  components/              // 既存のTab・RenderLayers等。stateは上記から取得するのみにする
```

- `store/`：Global状態のみ。ロジック（データ加工）は極力持たせず、`utils/`に分離する。
- `hooks/`：複数コンポーネントで繰り返されるLocal state＋操作関数のセット。
- `utils/`：純粋なデータ変換ロジック（React非依存）。

---

## 3. 現状資産の分類（調査結果サマリ）

| 分類 | 件数 | 状態 |
|---|---|---|
| Zustandストア（useStore.jsx） | 29 | 稼働中。用途重複あり |
| Reactコンテキスト（context.jsx） | 7 | **未使用**（Provider未実装、useContext呼び出し0件） |
| コンポーネント内useState | 約30ファイル | 一部完全重複あり |

### 統合・整理の対象（優先度順）

1. **クリック情報系ストア 16個 → 1個**
   `useClickmeshStore` `useClickareaStore` `useClicklanduseStore` `useClickplanningareaStore` `useClickpopmeshStore` `useClickneareststopStore` `useClickstopStore` `useFacilityStore` `useFareStore` `useClicknearestbuslineStore` `useClicknearestraillineStore` `useClicknearestridetimeStore` `useGetboundaryStore` `useClicknearestgetofftimeStore` `useColorareaStore` `useGraphdataStore`
   → いずれも「1値＋1setter」の同一構造。`clickInfoStore.js`にネストしたオブジェクトとして統合し、汎用setter（key指定）に置き換える。

2. **フィルターセットstateの重複（5ファイル完全一致）**
   `Future.jsx` `CustomerTab.jsx` `DemandTab.jsx` `CombinationTab.jsx` `AccessibilityTab.jsx` が同一の7〜9個のuseState（check, value, sliderLabel, destcurrent, weekdaycurrent, layercheckcurrent, kindcurrent, areacurrent, isPopUpVisible）を個別定義。
   → `hooks/useTabFilterState.js` に切り出す。

3. **地図カメラ位置ストアの重複（4個）**
   `useViewCustomerStore` `useViewAccesibilityStore` `useViewFutureStore` `useViewDemandStore` は全て同一構造。
   → `viewStore.js` に1本化し、タブキーで切替。

4. **TabController.jsxの手動同期パターン**
   `activeTab` と5つの`Toggled`stateを毎回手動で同期。
   → `activeTab`のみ保持し、`Toggled`は`activeTab === "xxx"`の派生値にする。

5. **未使用のcontext.jsx（7 Context）**
   → 削除。Zustand側と役割が重複しており実装を続ける理由がない。

6. **バグ疑い：useStateの分割代入ミス（5ファイル）**
   `Mesh_address.jsx` `Mesh_area.jsx` `make_mesh.jsx` `render_polygon.jsx` `Render_route.jsx` で
   `const {rendered, setRendered} = useState(false)` となっており、配列ではなくオブジェクト分割代入のため `rendered` は常に `undefined`。
   → `const [rendered, setRendered] = useState(false)` に修正（設計方針とは別だが要修正）。

7. **useDataStoreの肥大化**
   GeoJSONマージ処理がstore内に直接書かれている。
   → `utils/geojsonMerge.js` に分離し、storeはstate保持のみに戻す。

---

## 4. 今後の運用ルール（チェックリスト）

新しい変数・状態を追加するときは以下を確認する。

- [ ] この値は本当に複数コンポーネントで共有するか？（Yesでなければusestate）
- [ ] 既存のstoreファイル（dataStore / uiStore / viewStore / selectionStore / clickInfoStore）に追加できないか確認したか？（できなければ新規storeを検討）
- [ ] 他のstateから計算できないか？（できるならstate化しない）
- [ ] 同じ形のstate＋setterが他のコンポーネントに既にないか検索したか？（あればカスタムフック化を検討）

---

## 5. 未実施のTODO（次回以降の着手候補）

- [ ] `store/`フォルダの切り出しとimport更新
- [ ] クリック情報系16ストアの統合
- [ ] `useTabFilterState`フックの作成と5ファイルへの適用
- [ ] `viewStore`の1本化
- [ ] `TabController.jsx`のリファクタ
- [ ] `context.jsx`削除
- [ ] `useState`分割代入バグ5件の修正
- [ ] `useDataStore`からのロジック分離

本ドキュメントは方針のみであり、上記TODOは着手時に別途スコープを決めて対応する。

---

## 6. Mapインスタンス統合ロードマップ（WebGLコンテキスト対策・段階着手用）

### 背景

現状、タブ（AccessibilityTab / CustomerTab / DemandTab / CombinationTab / Future）ごとに別々の`<DeckGL>`/`<Map>`インスタンスを持っている（各`XxxRenderLayers.jsx`）。タブ切替は`{activeTab==="x" && <Tab/>}`でコンポーネントごと破棄・再生成する実装のため、切替のたびにMapインスタンス（＝WebGLコンテキスト）が作り直される。ブラウザが同時に持てるWebGLコンテキスト数には上限（目安8〜16）があり、長時間のワークショップ利用でタブ往復を繰り返すとクラッシュしうる。

なお、カメラ位置（`useViewDemandStore`等）やレイヤーの元データ（`useDataStore`等）はZustandに乗っているため、タブを離れても消えない。今回の問題はMapインスタンス自体の再生成コストに限定される。

最終形は「Mapインスタンスを1つに共有し、タブ切替は表示するlayers配列の切替だけにする」こと。ただし一気に5タブ分やると影響範囲が大きいため、実際の利用シーン（DemandTab⇔AccessibilityTabの行き来）に合わせて2タブから着手する。

### 段階的ステップ（1つずつ着手・検証する。まとめてやらない）

- [ ] **ステップ1**：`DemandRenderLayers.jsx`から、Mapを描画せずlayers配列だけを返すフック（例：`useDemandLayers()`）を切り出す。既存の`<DeckGL>`/`<Map>`はそのまま残し、ロジック分離のみ行う。DemandTab単体で今まで通り動くことだけ確認する。
- [ ] **ステップ2**：同様に`AccessibilityRenderLayers.jsx`から`useAccessibilityLayers()`を切り出す。
- [ ] **ステップ3**：2タブの親（Currenttab.jsx付近を想定）に共有の`<DeckGL>`/`<Map>`を1つ用意し、`activeTab`に応じて`useDemandLayers()`／`useAccessibilityLayers()`の結果を`layers`に渡す。各Tabファイル内の個別`<DeckGL>`は削除する。
- [ ] **ステップ4**：`useViewDemandStore`と`useViewAccesibilityStore`を1本化（`viewStore.js`、タブキー付き）。モード切替時にカメラ位置を保持するかリセットするかを決めて実装する。
- [ ] **ステップ5**：DemandTab⇔AccessibilityTabを何度も往復し、WebGLコンテキストが増え続けていないか実機（タブレット含む）で確認する。
- [ ] **ステップ6（余力があれば）**：同じパターンをCustomerTab／CombinationTab／Futureにも展開する。

### 進め方の注意

- 1ステップ＝1コミットを目安にし、都度動作確認する。5ファイルを一度に触らない。
- 実装中に「なぜこう書くか」が分からなくなったら、次に進む前に立ち止まって確認する（人に任せきりにしない）。
- 本セクションは既存TODOの「viewStoreの1本化」と一部重複するが、Mapインスタンス統合という目的に合わせて手順を具体化したもの。着手時はこちらを優先する。
