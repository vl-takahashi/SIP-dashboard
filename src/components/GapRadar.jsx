import React, { useState,useRef,useMemo } from 'react'

import { useDestStore, useDataStore, useAddressStore,useAreaStore,useColorareaStore, useBarchartStore } from "./useStore";
export default function Table(props) {
  const selectkind=props.selectkind||"未指定";
  const selectarea = props.selectarea || "未指定";
  const selectorigdest = props.selectorigdest || "未指定";
  const selectorig = props.selectorig || "未指定";
  const selectdest = props.selectdest || "未指定";
  const selectweekday = props.selectweekday || "未指定";
  const selecthour = props.selecthour|| "未指定";
  const selectdisplayHour = isNaN(selecthour) ? 12 : props.selecthour;
  const data0 = useDataStore((state) => state.data);
  const area=useAreaStore((state)=> state.area);
  const [areacurrent,setareacurrent]=useState("未選択");
  const [addresscurrent,setaddresscurrent]=useState("未選択");
  const selectArea=useAreaStore((state)=> state.selectArea);
  const address=useAddressStore((state)=> state.address);
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
  const data1=useMemo(() => {
    const datar=users["ridingtime_direct"];
    console.log(data0, selectdest, selectdisplayHour, selectweekday, selectarea,selectkind);
    let data=[]
    if(Array.isArray(datar) && datar.length > 0){
      datar.forEach(element => {
      console.log(element)
      data.push(element[2]);
    })
    };
    const dl=[];
    console.log(data);
    console.log("1")
    let data_addressed = null;
    let data_area = null;
    selectorigdest=="出発地ベース"?data.filter(function(item, index) { return item[0]===selectorig}):data.filter(function(item, index) { return item[0]===selectdest});
    console.log(data);
    // 各種データの抽出
    Object.keys(data0).forEach((d) => {
      if (d === "addressed" && Array.isArray(data0[d])) {
        for (const d1 of data0[d]) {
          data_addressed = d1.hasOwnProperty(d) ? d1[d][2] : d1[2];
        }
      } else if (d === "area_addressed" && Array.isArray(data0[d])) {
        for (const d1 of data0[d]) {
          data_area = d1.hasOwnProperty(d) ? d1[d][2] : d1[2];
        }
      }
    });
    
    // データのマージ処理（安全装置付き）
    console.log(data_addressed,data_area);
    if ((data_addressed||data_area)&&selectdest!="未選択"&&selectarea!="未選択"&&selectkind!="未選択"&&selectweekday!="未選択") {
      
      try {
        tbodyRef.current.replaceChildren();
        data.forEach(feature => {
          let f=feature.features;
          f.forEach(f1=>{
          let key1 = `${selectdest}_${selectweekday}_${selectdisplayHour}_ridingtime_direct`;
          let selectarea1 = `${selectarea}`;
            
          //console.log(f1.properties);
          //console.log(f1.properties[key1])
          //console.log(f1.properties[selectaddress])
          let tdarea=document.createElement("td")
          tdarea.textContent=f1.properties[selectarea1]
          let tdaddress=document.createElement("td")
          tdaddress.textContent="burabura"
          //tdaddress.textContent=f1.properties[selectedaddress]
          let tdridingtime=document.createElement("td")
          tdridingtime.textContent=String(parseInt(f1.properties[key1])/60)+"分";
          if (f1.properties[key1]/60!=0){
            dl.push([tdarea,tdarea.innerText,tdaddress,tdridingtime.textContent,tdridingtime])
          };
          }
        )});
        console.log(dl.sort(function(a,b){return(a[2] - b[2]);}));
        tbodyRef.current.innerHTML="";
        dl.forEach((item)=>{
          console.log(item[1])
          if(item[1]!=""){
            let tr=document.createElement("tr")
              tr.appendChild(item[0]);
              tr.appendChild(item[2]);
              tr.appendChild(item[4]);
            tbodyRef.current.appendChild(tr);
            tbRef.current.appendChild(tbodyRef.current)
          };
        
          }
          )
      } catch (e) {
        console.error("マージエラー:", e);
      }}
  }, [selectdest, selectorig,selectdisplayHour, selectweekday, selectarea,selectkind,selectorigdest]);
  return(
    <div>
      <h2>需給ギャップ地区</h2>
      <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ccc" }}>
        <table ref={tbRef}>
          <thead  style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <tr>
            <th style={{ position: "sticky", top: 0, background: "#f5f5f5", padding: "8px", borderBottom: "1px solid #ccc" }}>行ける地区</th>
            <th style={{ position: "sticky", top: 0, background: "#f5f5f5", padding: "8px", borderBottom: "1px solid #ccc" }}>行ける住所</th>
            <th style={{ position: "sticky", top: 0, background: "#f5f5f5", padding: "8px", borderBottom: "1px solid #ccc" }}>{selectkind}</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
          </tbody>

        </table>
      </div>
    </div>
  )
}