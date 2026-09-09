import React from "react";
import { useTimesliderStore, useLegendStore } from "./useStore";

export default function Legends(props) {
  const { tabName } = props;
  const time = useTimesliderStore((state) => state.time);
  const legends = useLegendStore((state) => state.legends);
  const isUnselected = time === -7/100000000;

  // ✅ q3_hour を計算（選択時間帯）
  const q3_hour = Math.round(time * 100000000) + 11;

  // ✅ 色分けロジック凡例（タブに応じて表示内容を変更）
  let legendItems;
  let isCircle = true; // デフォルト：丸

  if (tabName === 'CombinationTab') {
    // ✅ CombinationTab：q3_hour を含む動的な凡例（丸アイコン）
    isCircle = true;
    legendItems = isUnselected
      ? [
          { color: '#3b82f6', label: 'どれかの時間帯では利用可能' },
          { color: '#ef4444', label: 'どの時間帯もアクセスできない' },
        ]
      : [
          { color: '#3b82f6', label: `${q3_hour}時に合った便に乗れる` },
          { color: '#f59e0b', label: `${q3_hour}時と合っていない。` },
          { color: '#ef4444', label: 'どの時間帯もアクセスできない' },
        ];
  } else {
    // ✅ AccessibilityTab：useStore の legend データを使用（四角アイコン）
    isCircle = false;
    legendItems = legends.map((item) => ({
      color: `rgb(${item[0][0]}, ${item[0][1]}, ${item[0][2]})`,
      label: `${item[1]}-${legends.indexOf(item) < legends.length - 1 ? legends[legends.indexOf(item) + 1][1] : '∞'}分`,
    })) || [];
  }

  return (
    <div
      style={{
        ...props.style,
        width: '100%',
        maxWidth: 280,
        maxHeight: 300,
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        position: 'relative',
        padding: '8px',
      }}
    >
      <b style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>
        {isUnselected ? 'タイムスライダー：未選択' : 'タイムスライダー：選択中'}
      </b>
      {legendItems.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '8px',
            marginBottom: '6px',
            minWidth: 0,
          }}
        >
          <div
            style={{
              backgroundColor: item.color,
              width: isCircle ? '10px' : '24px',
              height: isCircle ? '10px' : '22px',
              flexShrink: 0,
              borderRadius: isCircle ? '50%' : '3px',
              marginTop: isCircle ? '4px' : '0px',
              border: !isCircle ? '1px solid rgba(0,0,0,0.1)' : 'none',
              padding: !isCircle ? '2px' : '0px',
            }}
          />
          <p
            style={{
              fontSize: '13px',
              margin: 0,
              minWidth: 0,
              lineHeight: '1.4',
              wordWrap: 'break-word',
              whiteSpace: 'normal',
            }}
          >
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
