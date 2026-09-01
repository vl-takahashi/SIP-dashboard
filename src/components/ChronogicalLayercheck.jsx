
import React, {useReducer,useStatem,createElement} from 'react'
import { useContext,useMemo,useRef,useEffect,useState} from "react";

import { initialCheck } from "./Globalvariable";
import { useDataStore,useCheckStore} from "./useStore";


const chronogicallayerchecked = () => {
  const areaRef =useRef();
  const landuseRef =useRef();
  const planningareaRef =useRef();
  const elevationRef =useRef();
  const roadRef =useRef();
  const raillineRef =useRef();
  const railstopRef =useRef();
  const buslineRef =useRef();
  const busstopRef =useRef();
  const popmeshRef =useRef();
  const facilityRef =useRef();
  const spatialbufferRef =useRef();
  const chronogicalbufferRef =useRef();
  const frequencyRef =useRef();
  const liptRef =useRef();
  const fareRef =useRef();
  const traveltimeRef =useRef();
  const transferRef =useRef();
  const persontripRef =useRef();
  const roadcensusRef =useRef();
  const ridershipRef =useRef();
  const reflist=[areaRef,landuseRef,planningareaRef,elevationRef,roadRef,raillineRef,
    railstopRef,buslineRef,busstopRef,popmeshRef,facilityRef,spatialbufferRef,chronogicalbufferRef,
    frequencyRef,liptRef,fareRef,transferRef,traveltimeRef,persontripRef,roadcensusRef,
    ridershipRef
  ]
  const data = useDataStore((state) => state.data);
  const check = useCheckStore((state) => state.Checklist);
  const setCheck = useCheckStore((state) => state.setChecklist);
  useEffect(() => {
    const ip=document.getElementById("layer");
    for (const f of reflist){
      for (let v in data){
        const ip_label=document.createElement("label");
        ip_label.innerText=v;
        let l=0;
        const div=document.createElement("div");
        const br=document.createElement("br");
        if (v===f.current.name){
          console.log(v);
            const ip_parent=f.current;


            for (let k in data[v]){
              const ip_child=document.createElement("input");
              const ip_child_label=document.createElement("label");
              ip_child.type="checkbox";
              ip_child.name=v;
              ip_child.id=data[v][k][0];
              ip_child.style.marginRight="5px";
              ip_child_label.style.marginRight="10px";
              ip_child_label.style.cursor="pointer";
              console.log(ip_child.name);
              ip_child.checked=true;
              ip_child_label.textContent=data[v][k][0];
              ip_child.addEventListener("change",function(){
                const kind=v;
                const detail=data[v][k][0];
                check(kind,detail);
              })
              console.log(check,data[v][k]);
              console.log(check.includes(data[v][k]));
              if (check.includes(data[v][k][0])===false){

                console.log(data[v][k][0])
                setCheck(data[v][k][0]);
                console.log(useCheckStore.getState(),check);

                const itemContainer=document.createElement("div");
                itemContainer.style.marginLeft="20px";
                itemContainer.style.marginBottom="5px";

                ip_parent.appendChild(ip_child);
                ip_parent.appendChild(ip_child_label);
                ip_parent.appendChild(br);

                childCheckboxes.push(ip_child);
              }
              l+=1;
            }

            // 親チェックボックス変更時の処理
            selectAllCheckbox.addEventListener("change",function(){
              childCheckboxes.forEach(cb=>{
                cb.checked=selectAllCheckbox.checked;
                // チェック状態変更時の処理をトリガー
                cb.dispatchEvent(new Event("change"));
              });
            });

            // 初期状態の親チェックボックスを更新
            const allChecked=childCheckboxes.every(cb=>cb.checked);
            const anyChecked=childCheckboxes.some(cb=>cb.checked);
            selectAllCheckbox.checked=allChecked;
            selectAllCheckbox.indeterminate=anyChecked && !allChecked;
        }
      }
      console.log(check);



    }
    // コンポーネントがマウント（DOMに配置）された後に実行
    console.log("DOM is ready!");
    
    // 必要であればここでDOM操作や初期化を行う
  }, [data]); // 依存配列を空にすると、マウント時のみ実行される
  // 動的ストア作成関数
  return (
        <div name="layer">
          <h2 style={{backgroundColor:"blue",border: "5px solid",color:"white",textAlign:"center"}}>レイヤー</h2>
          <details ref={areaRef} name="area"><summary>区域</summary></details>

          <details name="landuse" ref={landuseRef}><summary>土地利用</summary></details>

          <details name="planningarea" ref={planningareaRef}><summary>都市計画区域</summary></details>

          <details name="elevation" ref={elevationRef}><summary>標高</summary></details>

          <details name="road" ref={roadRef}><summary>道路</summary></details>

          <details name="railline" ref={raillineRef}><summary>鉄道</summary></details>

          <details name="railstop" ref={railstopRef}><summary>駅</summary></details>

          <details name="busline" ref={buslineRef}><summary>バス路線</summary></details>

          <details name="busstop" ref={busstopRef}><summary>バス停</summary></details>

          <details name="popmesh" ref={popmeshRef}><summary>人口メッシュ</summary></details>

          <details name="facility" ref={facilityRef}><summary>施設</summary></details>

          <details name="spatialbuffer" ref={spatialbufferRef}><summary>空間的空白</summary></details>

          <details name="chronogicalbuffer" ref={chronogicalbufferRef}><summary>所要時間</summary></details>

          <details name="frequency" ref={frequencyRef}><summary>リンク間運行本数</summary></details>

          <details name="lipt" ref={liptRef}><summary>公共交通の期待待ち時間(lipt)</summary></details>

          <details name="traveltime" ref={traveltimeRef}><summary>所要時間</summary></details>

          <details name="transfer" ref={transferRef}><summary>乗り継ぎ回数</summary></details>

          <details name="fare" ref={fareRef}><summary>運賃</summary></details>

          <details name="PersonTrip" ref={persontripRef}><summary>PT調査</summary></details>

          <details name="RoadCensus" ref={roadcensusRef}><summary>道路センサス</summary></details>

          <details name="Ridership" ref={ridershipRef}><summary>乗降データ</summary></details>
        </div>
           ) 
          }
export default chronogicallayerchecked;