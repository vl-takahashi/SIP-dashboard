import React from "react";
import { useTimesliderStore } from "./useStore";

export default function Legends(props) {
  const time = useTimesliderStore((state) => state.time);
  const isUnselected = time === -7/100000000;

  // ✅ 色分けロジック凡例
  const legendItems = isUnselected
    ? [
        { color: '#3b82f6', label: '🔵 青：どれかの時間帯では利用可能' },
        { color: '#ef4444', label: '🔴 赤：どの時間帯もアクセスできない' },
      ]
    : [
        { color: '#3b82f6', label: '🔵 青：希望到着時間帯に合った便に乗れる' },
        { color: '#f59e0b', label: '🟡 黄：希望到着時間帯と合っていない。' },
        { color: '#ef4444', label: '🔴 赤：どの時間帯もアクセスできない' },
      ];

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
              width: '10px',
              height: '10px',
              flexShrink: 0,
              borderRadius: '50%',
              marginTop: '4px',
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
