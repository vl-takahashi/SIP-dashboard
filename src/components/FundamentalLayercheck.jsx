
import React, {useReducer,useStatem,createElement} from 'react'
import { useContext,useMemo,useRef,useEffect,useState} from "react";
import { initialCheck } from "./Globalvariable";
import { useDataStore,useCheckStore} from "./useStore";
import { KanbanSquareDashed } from 'lucide-react';


const fundamentallayerchecked = () => {
  const areaRef =useRef();
  const landuseRef =useRef();
  const planningareaRef =useRef();
  const elevationRef =useRef();
  const roadRef =useRef();
  const raillineRef =useRef();
  const railstopRef =useRef();
  const rosenbusRef =useRef();
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
    railstopRef,rosenbusRef,busstopRef,popmeshRef,facilityRef,spatialbufferRef,chronogicalbufferRef,
    frequencyRef,liptRef,fareRef,transferRef,traveltimeRef,persontripRef,roadcensusRef,
    ridershipRef
  ]
  const check = useCheckStore((state) => state.Checklist);
  const setCheck1 = useCheckStore((state) => state.setChecklist);
  const setCheck = useDataStore((state) => state.setCheck);
  const data = useDataStore((state) => state.data);
  useEffect(() => {
    const ip=document.getElementById("layer");
    let data0={}
    let d0=[]
    console.log(data);
    for (let v in data){
      let uniqueArray=[];
      // 1. JSON文字列に変換してSetに入れ、重複を除去
      console.log(data[v])
      for (let v1 in data[v]){
        d0.push(data[v][v1][0]);
      }
      console.log(d0.slice(1,4));
      uniqueArray= new Set(d0);

      data0[v]=uniqueArray;
      console.log(data0[v]);
    }
    for (const f of reflist){
      for (let v in data0){
        const ip_label=document.createElement("label");
        ip_label.innerText=v;
        let l=0;
        const div=document.createElement("div");
        const br=document.createElement("br");
        console.log(v,f.current.name);
        if (v===f.current.name){
            let l2=[...data0[v]];
            const ip_parent=f.current;
            for (let k in l2){
              console.log(l2)
              const ip_child=document.createElement("input");
              const ip_child_label=document.createElement("label");
              ip_child.type="checkbox";
              ip_child.name=v[2];
              ip_child.id=k;
              try{
                console.log(ip_child.name,l2[k]);
                ip_child.checked=l2[k][1];
                ip_child_label.textContent=l2[k][0];
                ip_child.addEventListener("change",function(){
                  const kind=v;
                  console.log(kind);
                  console.log(KanbanSquareDashed);

                  const detail=l2[k];
                  console.log(detail);
                  setCheck1(kind,detail);
                })
                if (v="ridingtime"){
                  setDest(l2[k][0])
                }

              } catch{

              }
              console.log(l2[k]);
              console.log(check);
              if (!check.includes(l2[k])){

                ip_child.appendChild(ip_child_label);

                console.log(k)
                console.log(useCheckStore.getState());
                ip_parent.appendChild(ip_child);
                ip_parent.appendChild(ip_child_label);
                ip_parent.appendChild(br);
                l+=1;
              }
            }
        }
      }



    }
    // コンポーネントがマウント（DOMに配置）された後に実行
    console.log("DOM is ready!");
    
    // 必要であればここでDOM操作や初期化を行う
  }, [data]); // 依存配列を空にすると、マウント時のみ実行される
  // 動的ストア作成関数
  return (
        <div name="layer">

          <details><summary style={{backgroundColor:"blue",border: "5px solid",color:"white",textAlign:"center"}}>レイヤー
          </summary>
          <details ref={areaRef} name="area"><summary>区域</summary></details>

          <details name="landuse" ref={landuseRef}><summary>土地利用</summary></details>

          <details name="planningarea" ref={planningareaRef}><summary>都市計画区域</summary></details>

          <details name="elevation" ref={elevationRef}><summary>標高</summary></details>

          <details name="road" ref={roadRef}><summary>道路</summary></details>

          <details name="railline" ref={raillineRef}><summary>鉄道</summary></details>

          <details name="railstop" ref={railstopRef}><summary>駅</summary></details>

          <details name="rosenbus" ref={rosenbusRef}><summary>バス路線</summary></details>

          <details name="busstop" ref={busstopRef}><summary>バス停</summary></details>

          <details name="popmesh" ref={popmeshRef}><summary>人口メッシュ</summary></details>

          <details name="facility" ref={facilityRef}><summary>施設</summary></details>

          <details name="spatialbuffer" ref={spatialbufferRef}><summary>空間的空白</summary></details>

          <details name="ridingtime" ref={chronogicalbufferRef}><summary>時間帯空白</summary></details>

          <details name="frequency" ref={frequencyRef}><summary>リンク間運行本数</summary></details>

          <details name="lipt" ref={liptRef}><summary>公共交通の期待待ち時間(lipt)</summary></details>

          <details name="traveltime" ref={traveltimeRef}><summary>所要時間</summary></details>

          <details name="transfer" ref={transferRef}><summary>乗り継ぎ回数</summary></details>

          <details name="fare" ref={fareRef}><summary>運賃</summary></details>

          <details name="PersonTrip" ref={persontripRef}><summary>PT調査</summary></details>

          <details name="RoadCensus" ref={roadcensusRef}><summary>道路センサス</summary></details>

          <details name="Ridership" ref={ridershipRef}><summary>乗降データ</summary></details>

          </details>

        </div>
           ) 
          }
export default fundamentallayerchecked;