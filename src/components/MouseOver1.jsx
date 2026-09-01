import { useRef,useMemo,useState,useEffect } from "react";
import TinyBarChart from "./Barchart";
import AccessibleList from './AccessibilityList';
import React from 'react'
import { useHoverStore,useAreaStore,useClickmeshStore,useClickpopmeshStore,useClickareaStore,useDestStore,useDataStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore} from "./useStore";


const MouseOver1 = () => {
  const dialogRef = useRef();
    const selecthoverref = useRef();
    const hoverarea=["住所"];
    const hover=["居住地","バス停","最寄バス停","所要時間","運賃","運行本数","バス路線"];
    const selectHover=useHoverStore((state)=> state.selectHover);
    const [hovercurrent,sethovercurrent]=useState("未選択");
  let clickmeshaddress=useClickmeshStore((state) => state.clickmeshaddress);
  let clickmesharea=useClickmeshStore((state) => state.clickmesharea);
  let clickmeshpop=useClickmeshStore((state) => state.clickmeshpop);
  let clickareaaddress=useClickareaStore((state) => state.clickareaaddress);
  let clickareapop=useClickareaStore((state) => state.clickareapop);
  let clickareahousehold=useClickareaStore((state) => state.clickareahousehold);
  let clickareapopdensity=useClickareaStore((state) => state.clickareapopdensity);
  let clickstop=useClickstopStore((state) => state.clickstop);
  let clickpopmesh=useClickpopmeshStore((state) => state.clickpopmesh);
  let clickneareststop=useClickneareststopStore((state) => state.clickneareststop);
  let clicknearestridetime=useClicknearestridetimeStore((state) => state.clicknearestridetime);
  let clicknearestgetofftime=useClicknearestgetofftimeStore((state) => state.clicknearestgetofftime);
  let clicknearestbusline=useClicknearestbuslineStore((state) => state.clicknearestbusline);
    const area=useAreaStore((state)=> state.area);
  const handleShowModal = () => dialogRef.current?.showModal();
  const handleCloseModal = () => dialogRef.current?.close();
    const [areacurrent,setareacurrent]=useState("未選択");
  const selectareref=useRef(null);
    const selectArea=useAreaStore((state)=> state.selectArea);
  let clickdest=useDestStore((state) => state.select);
  return (
    <>
        <details >
            <summary style={{
            fontSize:'20px',
        }}>メッシュ情報</summary>
            
            <select
            defaultValue={(e) => e.target.value}
            onChange={(e) => {selectHover(e.target.value);sethovercurrent(e.target.value)}}
            ref={selecthoverref}
            style={{width:'80px'}}
            >
            <option>表示項目</option>

            {hover.map((item, index) => (
                <option key={index} defaultValue={item}>
                {item}
                </option>
            ))}
            </select>
            <select
            defaultValue={(e) => e.target.value}
            onChange={(e) => {selectArea(e.target.value);setareacurrent(e.target.value)}}
            ref={selectareref}
            style={{width:'80px'}}
            
            >
            <option>地域・住所</option>
            
            {area.map((item, index) => (
                <option key={index} defaultValue={item}>
                {item}
                </option>
            ))}
            </select>
            <details><summary>居住地</summary>
            <p>人口:{clickmeshpop}</p>
            <p>区域:{clickmesharea}</p>
            <p>住所:{clickmeshaddress}</p></details>
            <details><summary>バス停</summary>
            <p>名称:{clickstop}</p></details>
            <details><summary>最寄バス停</summary>
            <p>{clickneareststop}</p></details>
            <details><summary>所要時間</summary>
            <p>{clickneareststop}出発時刻:{clicknearestridetime}</p>
            <p>{clickdest}到着時刻:{clicknearestgetofftime}</p>
            <p>乗車系統:{clicknearestbusline}</p>
            <h4>住所:{clickmeshaddress}</h4>
            <p>人口:<b>{clickpopmesh}</b></p></details>
        </details>
    </>
  );
};
export default MouseOver1;