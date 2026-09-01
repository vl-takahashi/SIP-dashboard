import React, { useState,useRef,useEffect } from 'react'

import { useDestStore, useDataStore, useAddressStore,useAreaStore,useColorareaStore, useBarchartStore,useMeshidStore } from "./useStore";
export default function AccessibilityList(props) {
  const selectkind=props.selectkind||"未指定";
  const selectarea = props.selectarea || "未指定";
  const selectorigdest = props.selectorigdest || "未指定";
  const selectorig = props.selectorig || "未指定";
  const selectdest = props.selectdest || "未指定";
  const selectweekday = props.selectweekday || "未指定";
  const selecthour = props.selecthour|| "未指定";
  const selectdisplayHour = isNaN(selecthour) ? 12 : props.selecthour;
  // 📌 時間帯範囲フィルタリング
  const startHour = selectdisplayHour - 1;  // 前の時間（例：10時なら9時）
  const endHour = selectdisplayHour;        // 現在の時間
  const data0 = useDataStore((state) => state.data);
  const ridingtime=useDataStore((state) => state.ridingtime);
  const area=useAreaStore((state)=> state.area);
  const [areacurrent,setareacurrent]=useState("未選択");
  const [addresscurrent,setaddresscurrent]=useState("未選択");
  const selectArea=useAreaStore((state)=> state.selectArea);
  const address=useAddressStore((state)=> state.address);
  const areaid=useAreaStore((state) => state.areaid);
  const users=useDataStore((state)=> state.data);
  const selectedaddress=useAddressStore((state)=>state.select)
  const selectaddress=useAreaStore((state)=>state.selectArea)
  const selectaddressref=useRef();
  const selectdestref=useRef();
  const dest =useDestStore((state)=> state.dest);
  const selectDest=useDestStore((state)=> state.selectDest);
  const tbRef=useRef();
  const tbodyRef=useRef();
  const selectarearef=useRef();
  const mesh=useMeshidStore((state)=>state.meshid);
  // 📌 DOMレンダリング後にデータを処理するuseEffect
  useEffect(() => {
    const dl=[];
    console.log("1")
    let data_area = null;
    let data_addressed = null;
    //selectorigdest=="出発地ベース"?ridingtime.features.filter(function(item, index) { return item[0]===selectorig}):ridingtime.filter(function(item, index) { return item[0]===selectdest});
    console.log(ridingtime);

    // 安全装置：データが不足している場合は早期終了
    if (!ridingtime || !Array.isArray(ridingtime)) {
      return;
    }
    if (!data0 || Object.keys(data0).length === 0) {
      return;
    }

    // 各種データの抽出
    let name=null;
    let m2=null;
    let m3=null;
    Object.keys(data0).forEach((d) => {
      if (d === "area_addressed" && Array.isArray(data0[d])) {
        for (const d1 of data0[d]) {
          data_area = d1.hasOwnProperty(d) ? d1[d][2] : d1[2];
        }
      } else if (d === "addressed" && Array.isArray(data0[d])) {
        for (const d1 of data0[d]) {
          data_addressed = d1.hasOwnProperty(d) ? d1[d][2] : d1[2];
          name=d1.hasOwnProperty(d) ? d1[d][6] : d1[6];
        }

        for (const m of mesh){
          if (data_addressed.features.find(m)){
            m2=m
          }
        }
      } else if (d === "area" && Array.isArray(data0[d])) {
        for (const d1 of data0[d]) {
          data_area = d1.hasOwnProperty(d) ? d1[d][2] : d1[2];
        }

        for (const m of areaid){
          if (data_area.features.find(m)){
            m3=m
          }
        }
      }
    });

    if ((data_area||data_addressed||ridingtime)&&selectdest!="未選択"&&selectweekday!="未選択") {

      try {
        // refが準備できているか確認してから使用
        if (!tbodyRef.current) return;

        tbodyRef.current.replaceChildren();
        ridingtime.forEach(feature => {

          const matchaddress = data_addressed.features.find(p => p.properties?.MESH_ID === feature.properties.MESH_ID);
          const matcharea = data_area.features.find(p => p.properties?.MESH_ID === feature.properties.MESH_ID);
          console.log(matcharea,matchaddress)
          if (matchaddress||matcharea) {
            let tdarea=document.createElement("td")
            tdarea.textContent=matcharea.properties[selectarea]
            let tdaddress=document.createElement("td")
            tdaddress.textContent=matchaddress.properties["S_NAME"]
            let tdridingtime=document.createElement("td")
            tdridingtime.textContent=String(parseInt(feature.properties["ridingtime"])/60)+"分";
            if (feature.properties["ridingtime"]/60!=0){
              dl.push([tdarea.innerText, tdarea,tdaddress.innerText, tdaddress, tdridingtime])
            }
          }
        });
        console.log(dl.sort(function(a,b){return a[0].localeCompare(b[0]);}));
        tbodyRef.current.innerHTML="";
        dl.forEach((item)=>{
          if(item[0]!=""){
            let tr=document.createElement("tr")
            tr.appendChild(item[1]);
            tr.appendChild(item[3]);
            tr.appendChild(item[4]);
            tbodyRef.current.appendChild(tr);
            tbRef.current.appendChild(tbodyRef.current)
          }
        })
      } catch (e) {
        console.error("マージエラー:", e);
      }
    }
  }, [selectdest, selectdisplayHour, selectweekday, ridingtime, data0, mesh, areaid, startHour, endHour]);
  return(
    <div>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 8, fontWeight: 'bold' }}>
        {selectdest}に {startHour}:00～{endHour}:00 に到着できる住所
      </div>
      <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ccc" }}>
        <table ref={tbRef}>
          <thead  style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <tr>
            <th style={{ position: "sticky", top: 0, background: "#f5f5f5", padding: "8px", borderBottom: "1px solid #ccc" }}>地区</th>
            <th style={{ position: "sticky", top: 0, background: "#f5f5f5", padding: "8px", borderBottom: "1px solid #ccc" }}>住所</th>
            <th style={{ position: "sticky", top: 0, background: "#f5f5f5", padding: "8px", borderBottom: "1px solid #ccc" }}>所要時間</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
          </tbody>

        </table>
      </div>
    </div>
  )
}
