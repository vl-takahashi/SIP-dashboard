import { useRef,useMemo,useState,useEffect } from "react";
import TinyBarChart from "./Barchart";
import AccessibleList from './AccessibilityList';
import React from 'react'
import { useHoverStore,useAreaStore,useClickmeshStore,useClickpopmeshStore,useClickareaStore,useDestStore,useDataStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore} from "./useStore";


const Mouseover1 = () => {
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
    <div >
            <details><summary style={{
            fontSize:'20px',
        }}>区域情報</summary>
            <select
            defaultValue={(e) => e.target.value}
            onChange={(e) => {selectHover(e.target.value);sethovercurrent(e.target.value)}}
            ref={selecthoverref}
            style={{width:'80px'}}
            >
            <option>表示項目</option>

            {hoverarea.map((item, index) => (
                <option key={index} defaultValue={item}>
                {item}
                </option>
            ))}
            </select>
            <h4>住所:{clickareaaddress}</h4>
            <p>人口:<b>{clickareapop}</b></p>
            <p>世帯:<b>{clickareahousehold}世帯</b></p>
            <p>人口密度:<b>{clickareapopdensity}人/km2</b></p>
        </details>
    </div>
  );
};
export default Mouseover1;