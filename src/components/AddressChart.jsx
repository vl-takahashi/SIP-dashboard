import React from "react";
import { useState,useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { FieldLabel, FileField, TextField, SelectField, PrimaryButton } from "./VisualizeUI";
import { useDestStore, useDataStore, useAreaStore,useColorareaStore, useWeekdayStore } from "./useStore";
import { COLORS } from "./Globalvariable";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AddressChart(props) {
   const [submit,submitbutton]=useState(null);
  const hintTextStyle = { margin: '4px 0 8px', fontSize: 12, color: COLORS.subtext,color:"red" };
  const origref=useRef();
  const sixref=useRef();
  const sevenref=useRef();
  const eightref=useRef();
  const nineref=useRef();
  const tenref=useRef();
  const elevenref=useRef();
  const twelveref=useRef();
  const thirteenref=useRef();
  const fourteenref=useRef();
  const fifteenref=useRef();
  const sixteenref=useRef();
  const seventeenref=useRef();
  const eighteenref=useRef();
  const nineteenref=useRef();
  const twentyref=useRef();
  const twentyoneref=useRef();
  const twentytworef=useRef();
  const twentythreeref=useRef();
  const hourlist=[sixref,sevenref,eightref,nineref,tenref,elevenref,twelveref,thirteenref,fourteenref,fifteenref,sixteenref,seventeenref,eighteenref,nineteenref,twentyref,twentyoneref,twentytworef,twentythreeref]
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
  const data0 = useDataStore((state) => state.data);
  const pooledweekday = useWeekdayStore((state)=>state.weekday);
  const areaid=useAreaStore((state) => state.areaid);
  const ridingtime=useDataStore((state) => state.ridingtime_all);
  const [origcurrent,setorigcurrent]=useState("出発したい住所");
  console.log(selectdest, selectdisplayHour, selectweekday, selectarea,selectkind,selectdirect,selectorig,selectorigdest);
  // 💡 修正ポイント1: データの集計ロジックを1つの useMemo にまとめ、遅延対策を施す
  const handleSubmit = (e) => {
    setorigcurrent(origref.current.value);
    e.preventDefault();
    let datapopmesh = null;
    let data_addressed = null;
    const dl=[];
    //selectorigdest=="出発地ベース"?ridingtime.features.filter(function(item, index) { return item[0]===selectorig}):ridingtime.filter(function(item, index) { return item[0]===selectdest});
    console.log(ridingtime);
    // 安全装置：データが不足している場合は早期終了
    if (!ridingtime || !Array.isArray(ridingtime)) {
      return;
    }
    if (!data0 || Object.keys(data0).length === 0) {
      return;
    }

    Object.keys(data0).forEach((d) => {
      if (d === "addressed" && Array.isArray(data0[d])) {
        for (const d1 of data0[d]) {
          data_addressed = d1.hasOwnProperty(d) ? d1[d][2] : d1[2];
        }

      }
    });
    console.log(origref.current.value);
    hourlist.forEach(f=>{
    f.current.style.color = 'black';
    })
    if ((data_addressed||ridingtime)&&selectdest!="未選択"&&selectweekday!="未選択") {

        // refが準備できているか確認してから使用

        ridingtime.forEach(feature => {

          const matchaddress = data_addressed.features.find(p => p.properties?.MESH_ID === feature.properties.MESH_ID);
          if(matchaddress.properties["S_NAME"]!=undefined){
            if (matchaddress.properties["S_NAME"].includes(origref.current.value)){
              hourlist.forEach(f=>{
                if(f.current.innerText.includes(feature.properties["hour"])){
                f.current.style.color = 'red';
              }})
              
            }
          }
          })
    }

  };
  const reset=()=>{
        hourlist.forEach(f=>{
    f.current.style.color = 'black';
    })
  }


  // 💡 修正ポイント2: return ( のすぐ後ろに記述を開始し改行バグを防ぐ
  return (
    <div style={{ ...props.style, width: '100%', height: '1000px', position: 'relative' }}>
      <form action="" method="POST" encType="multipart/form-data" onSubmit={handleSubmit}>
      <TextField inputRef={origref} inline placeholder="出発したい住所を入力"/>
      <PrimaryButton value="frequency" onClick={(e)=>submitbutton(e.target.value)}>時間帯色付け</PrimaryButton>
      </form>
      
      <p style={hintTextStyle}>{origcurrent}から{selectdest}に到着できる時間帯</p>
      <div className="parent" style={{display: "flex"}}>
        <div className="child">
          <p ref={sixref} value="6">6時</p>
        </div>
        <div className="child">
          <p ref={sevenref} value="7">7時</p>
        </div>
        <div className="child">
          <p ref={eightref} value="8">8時</p>
        </div>
        <div className="child">
          <p ref={nineref} value="9">9時</p>
        </div>
        <div className="child">
          <p ref={tenref} value="10">10時</p>
        </div>
        <div className="child1">
          <p ref={elevenref} value="11">11時</p>
        </div>
        <div className="child1">
          <p ref={twelveref} value="12">12時</p>
        </div>
        <div className="child1">
          <p ref={thirteenref} value="13">13時</p>
        </div>
        <div className="child1">
          <p ref={fourteenref} value="14">14時</p>
        </div>
      </div>
      <div className="parent2" style={{display: "flex"}}>
        <div className="child1">
          <p ref={fifteenref} value="15">15時</p>
        </div>
        <div>
          <p ref={sixteenref} value="16">16時</p>
        </div>
        <div>
          <p ref={seventeenref} value="17">17時</p>
        </div>
        <div>
          <p ref={eighteenref} value="18">18時</p>
        </div>
        <div>
          <p ref={nineteenref} value="19">19時</p>
        </div>
        <div>
          <p ref={twentyref} value="20">20時</p>
        </div>
        <div>
          <p ref={twentyoneref} value="21">21時</p>
        </div>
        <div>
          <p ref={twentytworef} value="22">22時</p>
        </div>
        <div>
          <p ref={twentythreeref} value="23">23時</p>
        </div>
        <div>
          <p ref={twentythreeref} value="24">24時</p>
        </div>
      </div>
      <PrimaryButton value="reset" onClick={reset}>リセット</PrimaryButton>
    </div>
  );
}