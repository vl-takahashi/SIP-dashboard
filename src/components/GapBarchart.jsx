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
import { useDestStore, useDataStore, useColorareaStore, useBarchartStore, useWeekdayStore } from "./useStore";
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
  const Weekday=useWeekdayStore((state)=> state.select);
  const selectkind=props.selectkind||"未指定";
  const selectarea = props.selectarea || "未指定";
  const selectdest = props.selectdest || "未指定";
  const selectweekday = useWeekdayStore((state)=>state.select)
  const selectdirect=props.selectdirect||"直通";
  const selectorig=props.selectorig||"出発地";
  const selectorigdest=props.selectorigdest||"出発地";
  const selectdisplayHour = isNaN(props.selecthour) ? 12 : props.selecthour;
  const displayHourbeforeText= isNaN(props.selecthour) ? 12 : props.selecthour-1;
  const isFinishedStep1 = useBarchartStore((state) => state.bar);
  const data0 = useDataStore((state) => state.data);
  const pooledweekday = useWeekdayStore((state)=>state.weekday);
  console.log(selectdest, selectdisplayHour, selectweekday, selectarea,selectkind,selectdirect,selectorig,selectorigdest);
  // 💡 修正ポイント1: データの集計ロジックを1つの useMemo にまとめ、遅延対策を施す
  const { chartLabels, chartData3, colorCount } = useMemo(() => {
    let datapopmesh = null;
    let data_addressed = null;
    let dataridingtime = null;
    const sbd=selectdirect=="直通"?"direct":"beforetransit";
    const sad=selectdirect=="直通"?"direct":"aftertransit";
    if (!data0 || Object.keys(data0).length === 0) {
      return { chartLabels: [], chartData3: [], colorCount: 0 };
    }
    //タイムスライダーで選択した曜日のインデックス===chronogical_impact.jsxで追加した曜日フラグ列のインデックスと一致しているキー
    let selecteddayflag=selectweekday.indexOf(1);
    const wl = pooledweekday.filter((item) => item[selecteddayflag] === "1");
    let selectedday=Weekday.replace("-","");
    // 各種データの抽出
    Object.keys(data0).forEach((d) => {
      if (d === `ridingtime_${selectorigdest}` && Array.isArray(data0[d])) {
        for (const d1 of data0[d]) {
          const key2 = d1.hasOwnProperty(d) ? d1[d][2] : d1[2];
          const dataridingtime = key2.features.filter((feature)=>{
          for (const w of wl){
            let key1 = `${selectorigdest}_${w}_${selectdisplayHour}_rideontime_${sbd}`;
            let exceptionserviceday = `${selectorigdest}_${w}_${selectdisplayHour}_exceptionserviceday_${sbd}`;
            
              if (features?.properties?.hasOwnProperty(key1)&& !feature.properties[exceptionserviceday]?.includes(selectedday)){

                return true;
              }
            }
            return false;
          })
        }
        console.log(dataridingtime);
      } else if (d === "popmesh" && Array.isArray(data0[d])) {
          console.log(d,data0[d]);
        for (const d1 of data0[d]) {
          datapopmesh = d1.hasOwnProperty(d) ? d1[d][2] : d1[2];
          console.log(datapopmesh)
        }
      } else if (d === "area_addressed" && Array.isArray(data0[d])) {
        for (const d1 of data0[d]) {
          data_addressed = d1.hasOwnProperty(d) ? d1[d][2] : d1[2];
        }
      }
    });
    console.log(dataridingtime,data_addressed, datapopmesh)
    // データのマージ処理（安全装置付き）
    if (dataridingtime && data_addressed && datapopmesh) {
      try {
        dataridingtime.features.forEach(feature => {
          const matchaddressed = data_addressed.features.find(p => p.properties?.MESH_ID === feature.properties?.MESH_ID);
          const matchpopmesh = datapopmesh.features.find(p => p.properties?.MESH_ID === feature.properties?.MESH_ID);

          if (matchaddressed && matchpopmesh) {
            feature.properties[selectarea] = matchaddressed.properties[selectarea];
            feature.properties["PT00_2025"] = matchpopmesh.properties["PT00_2025"];
          }
        });
      } catch (e) {
        console.error("マージエラー:", e);
      }
    }

    // 人口の集計処理 (Reduce)
    let aggregated = {};
    if (dataridingtime && dataridingtime.features) {
      try {
        aggregated = dataridingtime.features.reduce((acc, curr) => {
          const areaKey = curr.properties[selectarea];
          if (areaKey) {
            const pop = curr.properties["PT00_2025"] || 0;
            if (curr.properties[key1] != null) {
              acc[areaKey] = (acc[areaKey] || 0) + pop;
            } else {
              acc[areaKey] = (acc[areaKey] || 0) + 0;
            }
          }
          return acc;
        }, {});
      } catch (e) {
        console.error("集計エラー:", e);
      }
    }

    // グラフ用の配列へ落とし込む
    let labelsTemp = [];
    let data3Temp = [];
    let kTemp = 0;

    for (const key in aggregated) {
      if (aggregated.hasOwnProperty(key)) {
        data3Temp.push(aggregated[key]);
        if (vividColors[kTemp]) {
          vividColors[kTemp].name = key;
        }
        labelsTemp.push(key);
        kTemp += 1;
      }
    }

    return { chartLabels: labelsTemp, chartData3: data3Temp, colorCount: kTemp };
  }, [selectdest, selectdisplayHour, selectweekday, selectarea,selectkind,selectdirect,selectorig,selectorigdest]);
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
          text: `カバー人口(${selectarea}別)`,
          font: { size: 20, weight: "bold" }
        }
      },
      scales: {
        y: {
          max: `${Math.max(maxl)+1000}`,
          min: 0,
          title: { display: false, text: '人口', font: { size: 10 } },
          ticks: { font: { size: 10 } }
        },
        x: {
          title: {
            display: true,
            text: `${displayDest}${selectorigdest}(${selectdirect}):${displayHourbeforeText}-${displayHourText}${displayWeekday}ダイヤ`,
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
      label: "カバー人口", // 凡例は1つに統合
      data: finalDataValues, // すべての数値が入った7個の配列
      backgroundColor: finalColors, // すべての色が入った7個の配列（棒ごとに色が変わります）
      barPercentage: 0.8, // 棒の太さ（お好みで 0.6 〜 0.9 で調整してください）
      categoryPercentage: 0.8
    }
  ]
  };

  // 💡 修正ポイント2: return ( のすぐ後ろに記述を開始し改行バグを防ぐ
  return (
    <div style={{ ...props.style, width: '100%', height: '300px', position: 'relative' }}>
      <h2>需給ギャップグラフ</h2>
      <Bar options={options} data={data} />
    </div>
  );
}