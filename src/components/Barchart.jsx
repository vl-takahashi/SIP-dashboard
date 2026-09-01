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
import { useDestStore, useDataStore, useAreaStore,useColorareaStore, useBarchartStore, useWeekdayStore } from "./useStore";
import { vividColors } from "./Globalvariable";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TinyBarChart(props) {
  const layercheckcurrent=props.layercheckcurrent
  const Weekday=useWeekdayStore((state)=> state.select);
  const selectkind=props.selectkind;
  const selectarea = props.selectarea;
  const selectdest = props.selectdest;
  const selectweekday = useWeekdayStore((state)=>state.select)
  const selectdirect=props.selectdirect;
  const selectorig=props.selectorig;
  const selectorigdest=props.selectorigdest;
  const selectdisplayHour = isNaN(props.selecthour) ? 12 : props.selecthour;
  const displayHourbeforeText= isNaN(props.selecthour) ? 12 : props.selecthour-1;
  const isFinishedStep1 = useBarchartStore((state) => state.bar);
  const data0 = useDataStore((state) => state.data);
  const pooledweekday = useWeekdayStore((state)=>state.weekday);
  const areaid=useAreaStore((state) => state.areaid);
  const ridingtime=useDataStore((state) => state.ridingtime);
  console.log(selectdest, selectdisplayHour, selectweekday, selectarea,selectkind,selectdirect,selectorig,selectorigdest);
  // 💡 修正ポイント1: データの集計ロジックを1つの useMemo にまとめ、遅延対策を施す
  const { chartLabels, chartData3, colorCount } = useMemo(() => {
    let datapopmesh = null;
    let data_area = null;
    const sbd=selectdirect=="直通"?"direct":"beforetransit";
    const sad=selectdirect=="直通"?"direct":"aftertransit";
    if (!data0 || Object.keys(data0).length === 0) {
      return { chartLabels: [], chartData3: [], colorCount: 0 };
    }
    //タイムスライダーで選択した曜日のインデックス===chronogical_impact.jsxで追加した曜日フラグ列のインデックスと一致しているキー
    let selecteddayflag=new Date(selectweekday).getDay();
    console.log(selecteddayflag);
    const wl = pooledweekday.filter((item) => item[selecteddayflag] === "1");
    let selectedday=Weekday;
    console.log(wl);
    
    // 各種データの抽出
    Object.keys(data0).forEach((d) => {
      if (d === "popmesh" && Array.isArray(data0[d])) {
          console.log(d,data0[d]);
        for (const d1 of data0[d]) {
          datapopmesh = d1.hasOwnProperty(d) ? d1[d][2] : d1[2];
        }
      } else if (d === "area_addressed" && Array.isArray(data0[d])) {
        
        for (const d1 of data0[d]) {
          data_area = d1.hasOwnProperty(d) ? d1[d][2] : d1[2];
          let m3=null;
          for (const m of areaid){
            if (data_area.features.find(m)){
              m3=m
            }
          }
        }
        

      }
    });
    // データのマージ処理（安全装置付き）
    // ✅ 方法2：filter + map で一度に処理
    for (const feature of datapopmesh.features) {
        const matcharea = data_area.features.find(p => p.properties?.MESH_ID === feature.properties.MESH_ID);
        
        feature.properties[selectarea] = matcharea.properties[selectarea];
      };
    // ✅ 方法2：filter + map で一度に処理
    for (const feature of ridingtime) {
        const matcharea = data_area.features.find(p => p.properties?.MESH_ID === feature.properties.MESH_ID);
        
        feature.properties[selectarea] = matcharea.properties[selectarea];
      };

    // 人口の集計処理 (Reduce)
    let aggregatedpop = {};
    let namespop = data_area.features.map(item =>item.properties[selectarea]); // ["りんご", "みかん"]
    for (const n of namespop){
      if (n!=null){
      aggregatedpop[n]=0;

      }
    }
    console.log(ridingtime);

      
    datapopmesh.features.forEach((curr) => {
          for (const [key, d1] of Object.entries(aggregatedpop)){
          if (key==curr.properties[selectarea])
            aggregatedpop[key]+=parseInt(curr.properties["PT00_2025"]);
          }
      });
    let aggregated = {};
    let names = data_area.features.map(item =>item.properties[selectarea]); // ["りんご", "みかん"]
    for (const n of names){
      if (n!=null){
      aggregated[n]=0;

      }
    }
    ridingtime.forEach((curr) => {
          for (const [key, d1] of Object.entries(aggregated)){
          if (key==curr.properties[selectarea])
            aggregated[key]+=parseInt(curr.properties["PT00_2025"]);
          }
      });
    let aggregatedr = {};
    let namesr = data_area.features.map(item =>item.properties[selectarea]); // ["りんご", "みかん"]
    for (const n of namesr){
      if (n!=null){
      aggregatedr[n]=0;

      }
    }
    for (const [keyp, d1p] of Object.entries(aggregatedpop)){
      for (const [key, d1] of Object.entries(aggregated)){
        if (keyp===key){
          aggregatedr[keyp]=parseInt(d1/d1p*100)
          console.log(d1,d1p)
        }
      }
    }
    console.log(aggregatedr);
    // グラフ用の配列へ落とし込む
    let labelsTemp = [];
    let data3Temp = [];
    let kTemp = 0;

    for (const key in aggregatedr) {
      if (aggregatedr.hasOwnProperty(key)) {
        data3Temp.push(aggregatedr[key]);
        if (vividColors[kTemp]) {
          vividColors[kTemp].name = key;
        }
        labelsTemp.push(key);
        kTemp += 1;
      }
    }

    return { chartLabels: labelsTemp, chartData3: data3Temp, colorCount: kTemp };
  }, [layercheckcurrent,selectdest, selectdisplayHour, selectweekday, selectarea,selectkind,selectdirect,selectorig,selectorigdest]);
  // データ組み立て
  let maxl=[];
  const vividColorsR = vividColors.slice(0, colorCount);
  // 1. 各地区の数値を1つの綺麗な配列にまとめる（[805, 7691, 29194...] の形にする）
  const finalDataValues = chartLabels.map((label, index) => {
    const rawValue = chartData3[index] !== undefined ? chartData3[index] : 0;
    maxl.push(isNaN(parseInt(rawValue)));
    return isNaN(parseInt(rawValue)) ? 0 : parseInt(rawValue);
  });

  // 💡 修正ポイント4: オプション内の不具合を修正
  const options = useMemo(() => {
    const displayDest = selectdest || "目的地未指定";
    const displayHourText = selectdisplayHour !== undefined ? `${selectdisplayHour}時` : "---時";
    const displayWeekday = selectweekday || "平日";
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display:false,
          labels: { font: { size: 8 } },
          position: "bottom"
        },
        title: {
          display: true,
          text: `人口カバー率(${selectarea}別)`,
          font: { size: 20, weight: "bold" }
        }
      },
      scales: {
        y: {
          max: 100,
          min: 0,
          title: { display: false, text: '人口', font: { size: 10 } },
            ticks: {
            callback: function (value) {
              return value + '%';
            },
          },
          ticks: { font: { size: 10 } }
        },
        x: {
          title: {
            display: true,
            text: selectorigdest=="dest"?`${displayDest}(${selectdirect})に${displayHourbeforeText}-${displayHourText}到着`:`${displayDest}(${selectdirect})から${displayHourbeforeText}-${displayHourText}出発`,
            font: { size: 20 }
          },
          ticks: { font: { size: 10 } }
        }
      }
    };
  }, [selectdest, selectdisplayHour, selectweekday,selectarea,selectkind,selectdirect,selectorig,selectorigdest]);

  // 2. 各地区の色を1つの配列にまとめる（['rgba(255,0,0,0.7)', 'rgba(255,85,0,0.7)'...] の形にする）
  const finalColors = vividColorsR.map((item) => {
    const hasRgba = item && item.rgba;
    const r = hasRgba ? item.rgba[0] : 128;
    const g = hasRgba ? item.rgba[1] : 128;
    const b = hasRgba ? item.rgba[2] : 128;
    let a = hasRgba ? item.rgba[3] : 0.7;
    if (a > 1) a = 0.7;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  });
  const data = {
    labels: chartLabels.length > 0 ? chartLabels : ["支所別"],
    datasets: [
    {
      label: `人口カバー率(${selectarea}別)`, // 凡例は1つに統合
      data: finalDataValues, // すべての数値が入った7個の配列
      backgroundColor: finalColors, // すべての色が入った7個の配列（棒ごとに色が変わります）
      barPercentage: 0.8, // 棒の太さ（お好みで 0.6 〜 0.9 で調整してください）
      categoryPercentage: 0.8
    }
  ]
  };
  // 💡 💡 修正ポイント: データ更新中（一瞬の空っぽ）の時は安全な表示で待機させる
  if (chartLabels.length === 0 || chartData3.length === 0) {
    return (
      <div style={{ ...props.style, height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        目的地、ダイヤ、サービス、地域区分を選択してください。
      </div>
    );
  }
  if (selectarea==="未選択"&&(chartLabels.length === 0 || chartData3.length === 0)){
    return (
      <div style={{ ...props.style, height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        地域区分を選択してください。
      </div>
    );

  }
  // 💡 💡 修正ポイント: データ更新中（一瞬の空っぽ）の時は安全な表示で待機させる
  if (selectkind!="所要時間") {
    return (
      <div style={{ ...props.style, height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        サービスで「所要時間」を選択してください。
      </div>
    );
  }

  // 💡 修正ポイント2: return ( のすぐ後ろに記述を開始し改行バグを防ぐ
  return (
    <div style={{ ...props.style, width: '100%', height: '300px', position: 'relative' }}>
      <Bar options={options} data={data} />
    </div>
  );
}