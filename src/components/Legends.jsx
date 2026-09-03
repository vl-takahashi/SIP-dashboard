import React from "react";
import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useDestStore, useLegendStore,useDataStore, useColorareaStore, useBarchartStore } from "./useStore";
import { vividColors } from "./Globalvariable";
import { Joystick } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Legends(props) {
  const kind = props.selectkind;
  const legends = useLegendStore((state) => state.legends);
  const legendsl = [...new Set(legends.map(JSON.stringify))].map(JSON.parse);
  legendsl.sort((a, b) => b[0][1] - a[0][1]);
  const m={"所要時間":"分","運賃":"円","運行本数":"本"};
  const m1=m[kind];
  const l01=kind==="所要時間"?[0,10,20,30,40,50,60]:kind==="運賃"?[0,200,400,600,800,1000,1200]:[5,10,15,20];
  let n=0;

  // メッシュ色計算関数（所要時間：分→秒変換）
  const calculateRidingTimeColor = (minutes) => {
    const seconds = minutes * 60;
    const r = Math.max(0, Math.min(255, 255 - (seconds / 10)));
    const g = 255;
    const b = Math.max(0, Math.min(255, seconds / 10));
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  };

  // メッシュ色計算関数（運賃）
  const calculateFareColor = (fare) => {
    const r = Math.max(0, Math.min(255, Math.floor((fare / 1000) * 135)));
    const g = Math.max(0, Math.min(255, Math.floor((fare / 1000) * 196)));
    const b = 255;
    return `rgb(${r}, ${g}, ${b})`;
  };

  // メッシュ色計算関数（運行本数）
  const calculateFrequencyColor = (frequency) => {
    const r = 0;
    const g = Math.max(0, Math.min(153, 153 - Math.floor((frequency * 153) / 5)));
    const b = Math.max(0, Math.min(204, 204 - Math.floor((frequency * 204) / 5)));
    return `rgb(${r}, ${g}, ${b})`;
  };

  // 凡例の色を取得
  const getLegendColor = (val, i, match) => {
    const midpoint = (l01[i] + l01[i + 1]) / 2;

    if (kind === "所要時間") {
      return calculateRidingTimeColor(midpoint);
    } else if (kind === "運賃") {
      return calculateFareColor(midpoint);
    } else if (kind === "運行本数") {
      return calculateFrequencyColor(midpoint);
    }
    // 既存ロジック（フォールバック）
    return match ? `rgb(${match[0][0]}, ${match[0][1]}, ${match[0][2]})` : 'rgb(200,200,200)';
  };

  return (
    // ★タイムスライダー操作で行数・文字幅（分/円/本の単位や桁数）が変わっても、
    //   親の白背景パネルの外に飛び出さないよう、幅を固定し縦はスクロールに切り出す。
    <div
      style={{
        ...props.style,
        width: '100%',
        maxWidth: 240,
        maxHeight: 300,
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <b>{kind}</b>
      {l01.slice(0,-1).map((val,i)=>
      { const match = legendsl.find(item=>item[1]>=l01[i]&&item[1]<l01[i+1]);
        return(

        <div key={i} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minWidth: 0 }}>
          <div style={{ backgroundColor: getLegendColor(val, i, match), width:'40px', height:'22px', flexShrink: 0, padding: '2px'}}>

          </div>
          <p style={{
            fontSize:'16px',
            margin: '2px 0 2px 6px',
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>{l01[i]}-{l01[i+1]}{m1}</p>
        </div>
       );
      })}
    </div>
  );
}
