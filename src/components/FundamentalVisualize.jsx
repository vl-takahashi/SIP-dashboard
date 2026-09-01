import React from 'react';
import { useRef, useState } from "react";
import Render_point from './RenderPoint';
import RenderArea from './RenderArea';
import RenderLine from './RenderLine';
import RenderRoute from './RenderRoute';
import RenderStop from './RenderStop';
import MakeMesh from './MakeMesh';
import Visualization from"./visualization.png";
import Jmds from './Jmds';
import Drm from './Drm';
import MeshAddress from './MeshAddress';
import MeshArea from './MeshArea';
import SpatialImpact from './SpatialImpact'
import ChronogicalImpact from './ChronogicalImpact'
import Liptrender from './LiptRender';
import { FileField, TextField, SelectField, PrimaryButton } from "./VisualizeUI";
import { useLoadingStore } from "./useStore";
// 配色トークンはglobalvariable.jsxに集約（AccessibilityTab.jsx等の他画面とも共有する）
import { COLORS } from "./Globalvariable";
// タブレット幅（狭い画面）かどうかを判定する共有フック。プロジェクター等の解像度差にも使う想定。
import { useBreakpoint } from "./useBreakpoint";
// 各フォーム共通の見た目パーツ（カード枠等）
import { VisualizeCard } from "./VisualizeUI";

// 10個のフォームコンポーネントを機能別に4カテゴリへ整理。
// カテゴリ（横タブ）→カード（VisualizeCard）の2階層構成にする。
const categories = [
  {
    label: '基本表示',
    description: 'アップロードしたデータを地図上にそのまま表示します。',
    cards: [
      {
        title: 'ポイント表示',
        badge: '基本表示',
        description: 'CSV形式のデータをアップロードし、地図に表示します。',
        node: <Render_point />,
        guideline: '#point',
      },
      {
        title: '区域表示',
        badge: '基本表示',
        description: 'GeoJSON / JSON形式の区域データをアップロードし、地図に表示します。',
        node: <RenderArea />,
        guideline: '#area-mesh',
      },
      {
        title: '経路表示',
        badge: '基本表示',
        description: 'GeoJSON / JSON形式の経路データをアップロードし、地図に表示します。',
        node: <RenderLine />,
        guideline: '#line',
      },
      {
        title: 'バス路線表示',
        badge: '基本表示',
        description: 'GTFSデータから路線・便情報を読み込み、地図に路線表示します。',
        node: <RenderRoute />,
        guideline: '#frequency',
      },
      {
        title: 'バス停表示',
        badge: '基本表示',
        description: 'GTFSデータから路線・便情報を読み込み、地図に停留所等を表示します。',
        node: <RenderStop />,
        guideline: '#frequency',
      },
      {
        title: '人口メッシュ表示',
        badge: '基本表示',
        description: '国土数値情報のメッシュ統計データ（GeoJSON）を読み込み、人口メッシュを表示します。',
        node: <MakeMesh />,
      },
    ],
  },
  {
    label: '空白分析',
    description: '表示中の人口メッシュとGTFSから、公共交通のアクセス圏域（空白地域）を算出します。',
    // このカテゴリのみ、2つの算出フォームを横並びのサブタブで切り替える
    subTabs: true,
    cards: [
      {
        title: '空間的圏域算出',
        badge: '空白分析',
        description: 'バス停を中心とした空間的なアクセス圏域を算出します。',
        node: <SpatialImpact />,
        guideline: '#spatial-gap',
      },
      {
        title: '時間帯別到達圏域算出',
        badge: '空白分析',
        description: '目的地・出発地ごとの時間帯別アクセス圏域(所要時間/運賃帯/運行本数)を可視化します。',
        node: <ChronogicalImpact />,
        guideline: '#temporal-gap',
      },
    ],
  },
  {
    label: 'データ処理',
    description: '人口メッシュデータに住所・区域などの属性情報を付与します。',
    cards: [
      {
        title: '住所割り当て',
        badge: 'データ処理',
        description: '人口メッシュに、地域区分ファイルから住所情報を付与します。',
        node: <MeshAddress />,
      },
      {
        title: '区域割り当て',
        badge: 'データ処理',
        description: '人口メッシュに、地域区分ファイルから区域情報を付与します。',
        node: <MeshArea />,
      },
    ],
  },
  {
    label: '外部診断',
    description: '外部データ基盤（JMDS／DRM）や診断ツール（LIPT）との接続・実行を確認します。',
    cards: [
      {
        title: 'JMDS接続テスト',
        badge: '外部診断',
        description: 'JMDS（モビリティデータ基盤）への接続を確認します。',
        node: <Jmds />,
      },
      {
        title: 'DRM接続テスト',
        badge: '外部診断',
        description: 'DRM（道路データ基盤）への接続を確認します。',
        node: <Drm />,
      },
      {
        title: 'LIPT診断',
        badge: '外部診断',
        description: '市区町村名とGTFSデータをもとにLIPT診断を実行します。',
        node: <Liptrender />,
        guideline: '#lipt',
      },
    ],
  },
];

export const FundamentalVisualize = () => {
  const editRef=useRef(null);
  const dialogRef = useRef();
  const [activeTab, setActiveTab] = useState(0);
  // 空白分析タブ内のサブタブ（現状は「空間的圏域算出」「時間帯別到達圏域算出」の2つ）
  const [activeSubTab, setActiveSubTab] = useState(0);
  // 各タブ（Jmds/Drm/Render_polygon等）がsubmit〜レスポンス受信の間trueにする共有state。
  // ここではその値を見て、タブコンテンツの上にローディング表示を重ねるだけ。
  const loading = useLoadingStore((state) => state.loading);
  const { isTablet } = useBreakpoint();
  const handleShowModal = () => dialogRef.current?.showModal();
  const handleCloseModal = () => dialogRef.current?.close();
  const activeCategory = categories[activeTab];

  return (
    <>
      <button type="button" onClick={handleShowModal} style={{backgroundColor: '#08335c', padding: 5 }}>
        <font color="white">データ可視化</font>
      </button>
      <dialog
        ref={dialogRef}
        style={{
          border: 'none',
          borderRadius: 16,
          padding: 0,
          width: '820px',
          // タブレット幅では横マージンを詰めて使える面積を増やす
          maxWidth: isTablet ? '96vw' : '92vw',
          boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: isTablet ? '90vh' : '82vh' }}>
          {/* ヘッダー */}
          <div style={{ padding: isTablet ? '14px 16px 0' : '20px 24px 0' }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: COLORS.text }}>可視化メニュー</h2>
            <p style={{ margin: '4px 0 16px', fontSize: 13, color: COLORS.subtext }}>
              レイヤー表示・分析結果を選択します。
            </p>
          </div>

          {/* カテゴリタブ（アンダーライン形式）。タブレットではタップしやすいよう縦の余白を広げる */}
          <div
            style={{
              display: 'flex',
              gap: isTablet ? 12 : 16,
              borderBottom: `2px solid ${COLORS.border}`,
              padding: isTablet ? '8px 8px' : '12px 16px',
              overflowX: 'auto',
              backgroundColor: '#f5f5f5',
              minHeight: '56px',
              alignItems: 'center',
            }}
          >
            {categories.map((cat, index) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => { setActiveTab(index); setActiveSubTab(0); }}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === index ? `3px solid ${COLORS.orange}` : '3px solid transparent',
                  color: activeTab === index ? COLORS.orange : COLORS.subtext,
                  fontWeight: activeTab === index ? 600 : 500,
                  fontSize: 15,
                  // タブレットは指でタップするため、タップ領域(44px目安)を確保する
                  padding: isTablet ? '16px 10px' : '14px 12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* タブコンテンツ。カテゴリ説明文＋カード一覧。position:relativeにして、
              ローディング中はこの上にオーバーレイを重ねる */}
          <div style={{ position: 'relative', padding: isTablet ? '16px' : '20px 24px', overflowY: 'auto', flex: 1 }}>
            <p style={{ margin: '0 0 16px', fontSize: 12.5, color: COLORS.subtext }}>
              {activeCategory.description}
            </p>

            {activeCategory.subTabs ? (
              <>
                {/* サブタブ（横並びのピル型ボタン）。選択中の1件だけを下に表示する */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {activeCategory.cards.map((card, subIndex) => (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => setActiveSubTab(subIndex)}
                      style={{
                        border: `1px solid ${activeSubTab === subIndex ? COLORS.orange : COLORS.border}`,
                        background: activeSubTab === subIndex ? COLORS.orange : '#fff',
                        color: activeSubTab === subIndex ? '#fff' : COLORS.text,
                        borderRadius: 999,
                        padding: '7px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {card.title}
                    </button>
                  ))}
                </div>

                {(() => {
                  const card = activeCategory.cards[activeSubTab];
                  return (
                    <VisualizeCard title={card.title} badge={card.badge} description={card.description} guideline={card.guideline}>
                      {card.node}
                    </VisualizeCard>
                  );
                })()}
              </>
            ) : (
              activeCategory.cards.map((card) => (
                <VisualizeCard
                  key={card.title}
                  title={card.title}
                  badge={card.badge}
                  description={card.description}
                  guideline={card.guideline}
                >
                  {card.node}
                </VisualizeCard>
              ))
            )}

            {loading && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  background: 'rgba(255,255,255,0.85)',
                  zIndex: 5,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: `3px solid ${COLORS.orangeSoft}`,
                    borderTopColor: COLORS.orange,
                    animation: 'fv-spin 0.8s linear infinite',
                  }}
                />
                <span style={{ fontSize: 13, color: COLORS.subtext }}>処理中です。しばらくお待ちください…</span>
                <style>{`@keyframes fv-spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
          </div>

          {/* フッター */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '12px 24px',
              borderTop: `1px solid ${COLORS.border}`,
            }}
          >
            <button
              type="button"
              onClick={handleCloseModal}
              style={{
                background: 'none',
                border: 'none',
                color: COLORS.subtext,
                fontSize: 13,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};
export default FundamentalVisualize;
