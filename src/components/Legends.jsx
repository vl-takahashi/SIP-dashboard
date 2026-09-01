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
        if (!match) return null;
        return(

        <div key={i} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', minWidth: 0 }}>
          <div style={{ backgroundColor:  `rgb(${match[0][0]}, ${match[0][1]}, ${match[0][2]})`,width:'40px', height:'22px', flexShrink: 0, padding: '2px'}}>

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