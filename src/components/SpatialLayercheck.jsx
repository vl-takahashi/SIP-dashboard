
import React, {useReducer,useStatem,createElement} from 'react'
import { useContext,useMemo,useRef,useEffect,useState} from "react";

import { initialCheck,pop } from "./Globalvariable";
import { useDataStore,useCheckStore,usePopStore} from "./useStore";
const spatiallayerchecked = () => {
  const [popcurrent,setpopcurrent]=useState("下記より選択");
  const selectpopRef =useRef();
  const selectpop = (selectedKeyName) => {
    // ★まずストアを更新
    usePopStore.setState({ pop: selectedKeyName });
    
    // ★その後、データ処理を実行
    setTimeout(() => {
      // フィルタリングと色設定を実行
    }, 0);
  };
  const [mesh,setMesh]=useState("250")
  const areaRef =useRef();
  const landuseRef =useRef();
  const planningareaRef =useRef();
  const elevationRef =useRef();
  const roadRef =useRef();
  const setDimention=useDataStore((state) => state.setDimention);
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
  const tramRef=useRef();
  const highwaybusRef=useRef();
  const faredirectRef =useRef();
  const traveltimedirectRef =useRef();
  const faretransitRef =useRef();
  const traveltimetransitRef =useRef();
  const transfertransitRef =useRef();
  const reflist=[areaRef,roadRef,raillineRef,
    railstopRef,buslineRef,busstopRef,popmeshRef,facilityRef,spatialbufferRef,
    frequencyRef,liptRef,faredirectRef,traveltimedirectRef,faretransitRef,transfertransitRef,traveltimetransitRef
  ]
  const check = useCheckStore((state) => state.Checklist);
  const setCheck = useDataStore((state) => state.setCheck);
  const flag = useDataStore((state) => state.flag);
  const data = useDataStore((state) => state.data);
  const agencyValue = useDataStore((state) => state.agencyValue);
  useEffect(() => {
    // ★全 summary のフォントサイズを統一
    if (!window._summaryStyleAdded) {
      const style = document.createElement("style");
      style.textContent = `summary { font-size: 20px; }`;
      document.head.appendChild(style);
      window._summaryStyleAdded = true;
    }

    const ip=document.getElementById("layer");
    let data0={}
    console.log(data);
    for (let v in data){
      // 1. JSON文字列に変換してSetに入れ、重複を除去
      const uniqueSet = new Set(data[v].map(arr => JSON.stringify(arr)));

      // 2. 文字列を配列に戻す
      const uniqueArray = Array.from(uniqueSet).map(str => JSON.parse(str));
      data0[v]=uniqueArray;
    }
    for (const f of reflist){
      for (let v in data0){
        const ip_label=document.createElement("label");
        ip_label.innerText=v;
        let l=0;
        const div=document.createElement("div");
        const br=document.createElement("br");
        if (v===f.current.name){
            const ip_parent=f.current;

            // ★親Summary のフォントサイズを大きく
            const summary = ip_parent.querySelector("summary");
            if (summary) {
              summary.style.fontSize = "18px";
            }

            // ★前回の実行で追加されたチェックボックスをすべて削除
            Array.from(ip_parent.querySelectorAll('input[type="checkbox"]')).forEach(el => el.remove());
            Array.from(ip_parent.querySelectorAll('label')).forEach(el => el.remove());
            Array.from(ip_parent.querySelectorAll('br')).forEach(el => el.remove());

            // ★重複防止：リセット
            const existingLabels = new Set();

            // ★複数の agencyValue でグルーピング
            const groupedByAgency = agencyValue.length > 0
              ? Object.fromEntries(
                  agencyValue.map(agency => [
                    agency,
                    data0[v].filter(item => item[3] === agency)
                  ])
                )
              : {};
            const ungroupedItems = agencyValue.length > 0
              ? data0[v].filter(item => !agencyValue.includes(item[3]))
              : data0[v];

            console.log(`📊 [${v}] agencyValue: ${JSON.stringify(agencyValue)}, グループ: ${Object.keys(groupedByAgency).length}, グループなし: ${ungroupedItems.length}`);

            // ★グルーピングされたアイテム：親子チェックボックスを作成
            for (const [agencyName, items] of Object.entries(groupedByAgency)) {
              // ★子が0件の場合はスキップ（該当しない親チェックボックスを作らない）
              if (items.length === 0) {
                continue;
              }
              console.log(`👨‍👩‍👧‍👦 親チェックボックス作成: ${agencyName} (${items.length}件)`);

              const agencyKey = `${v}_${agencyName}`;

              // 事業者が既に表示済みなら skip
              if (existingLabels.has(agencyKey)) {
                continue;
              }

              // ★親チェックボックス：グルーピング名称
              const parent_input = document.createElement("input");
              const parent_label = document.createElement("label");
              parent_input.type = "checkbox";
              parent_input.id = agencyKey;
              // ★配下のすべての子がチェックされている場合だけ親も checked
              const allChildrenChecked = items.every(item => item[1]);
              parent_input.checked = allChildrenChecked;
              parent_input.style.marginRight = "5px";
              parent_input.style.accentColor = "blue";
              parent_input.dataset.agency = agencyName;
              parent_input.dataset.isParent = "true";
              parent_label.style.marginRight = "10px";
              parent_label.style.cursor = "pointer";
              parent_label.style.fontWeight = "bold";
              parent_label.style.color = "blue";
              parent_label.style.fontSize = "16px";
              parent_label.textContent = agencyName;

              ip_parent.appendChild(parent_input);
              ip_parent.appendChild(parent_label);
              ip_parent.appendChild(document.createElement("br"));

              // ★子チェックボックスを格納するコンテナを作成
              const childrenContainer = document.createElement("div");
              childrenContainer.dataset.agencyContainer = `${v}_${agencyName}`;
              childrenContainer.style.display = "block";  // デフォルト展開

              // ★子チェックボックス：各ルート
              for (const k1 of items) {
                let label;
                try{
                  // GeoJSON の detail フィールドから取得
                  const geojson = k1[2];
                  if (geojson && geojson.features && geojson.features.length > 0) {
                    label = geojson.features[0].properties?.detail || k1[0].split("_")[0];
                  } else {
                    label = k1[0].split("_").length>0?k1[0].split("_")[0]:k1[0];
                  }
                } catch {
                  label = k1[0].split("_").length>0&&k1[0] != null ? k1[0].split("_")[0] : null;
                }
                if (existingLabels.has(label)) {
                  continue;
                }

                const ip_child = document.createElement("input");
                const ip_child_label = document.createElement("label");
                const item_br = document.createElement("br");
                ip_child.type = "checkbox";
                ip_child.name = v;
                ip_child.id = label;
                ip_child.style.marginRight = "5px";
                ip_child.style.marginLeft = "30px";
                ip_child_label.style.marginRight = "10px";
                ip_child_label.style.cursor = "pointer";
                ip_child_label.style.fontSize = "14px";
                ip_child.checked = k1[1];
                ip_child_label.textContent = label;

                // ★イベント委譲用：data属性にkind, detail, agencyを保存
                ip_child.dataset.kind = v;
                ip_child.dataset.detail = JSON.stringify(k1[0]);
                ip_child.dataset.agency = agencyName;

                // ★子チェックボックスをコンテナに追加
                childrenContainer.appendChild(ip_child);
                childrenContainer.appendChild(ip_child_label);
                childrenContainer.appendChild(item_br);
                l += 1;

                existingLabels.add(label);
              }

              // ★コンテナを親要素に追加
              ip_parent.appendChild(childrenContainer);
              existingLabels.add(agencyKey);
            }

            // ★グルーピングなしのアイテム：子チェックボックスのみ作成（親なし）
            for (const k1 of ungroupedItems) {
              console.log(k1);
              let label;
              try{
                // GeoJSON の detail フィールドから取得
                const geojson = k1[2];
                if (geojson && geojson.features && geojson.features.length > 0) {
                  label = geojson.features[0].properties?.detail || k1[0];
                } else {
                  label = k1[0].split("_").length>0?k1[0].split("_")[0]:k1[0];
                }
              } catch {
                label = k1[0].split("_").length>0&&k1[0] != null ? k1[0].split("_")[0] : null;
              }

              if (existingLabels.has(label)) {
                continue;
              }

              const ip_child = document.createElement("input");
              const ip_child_label = document.createElement("label");
              const item_br = document.createElement("br");
              ip_child.type = "checkbox";
              ip_child.name = v;
              ip_child.id = label;
              ip_child.style.marginRight = "5px";
              ip_child_label.style.marginRight = "10px";
              ip_child_label.style.cursor = "pointer";
              ip_child.checked = k1[1];
              ip_child_label.textContent = label;

              ip_child.dataset.kind = v;
              ip_child.dataset.detail = JSON.stringify(k1[0]);

              ip_parent.appendChild(ip_child);
              ip_parent.appendChild(ip_child_label);
              ip_parent.appendChild(item_br);

              existingLabels.add(label);
            }

            // ★イベント委譲：古いリスナーを削除してから新しく登録
            // （何度も切り替えしても重複しないようにするため、毎回削除・再登録）
            if (ip_parent._clickListenerFunc) {
              ip_parent.removeEventListener("click", ip_parent._clickListenerFunc);
            }

            const handleCheckboxClick = (e) => {
              if (e.target.type === "checkbox") {
                // ★親チェックボックスの場合：配下の子をすべてチェック/アンチェック
                if (e.target.dataset.isParent === "true") {
                  const agency = e.target.dataset.agency;
                  const children = ip_parent.querySelectorAll(`input[data-agency="${agency}"]:not([data-isParent])`);
                  children.forEach(cb => {
                    cb.checked = e.target.checked;
                    // ★配下の子すべてに setCheck を実行
                    // 第3引数に e.target.checked を渡して、反転ではなく直接設定する
                    if (cb.dataset.kind && cb.dataset.detail) {
                      const kind = cb.dataset.kind;
                      const detail = JSON.parse(cb.dataset.detail);
                      const desiredState = e.target.checked;  // ★親チェックボックスの状態を直接使用
                      setCheck(kind, detail, desiredState);
                    }
                  });
                  console.log(`✅ 親チェックボックス [${agency}] が ${e.target.checked ? "ON" : "OFF"}`);
                } else {
                  // ★子チェックボックスの場合：反転（第3引数なし）
                  const kind = e.target.dataset.kind;
                  const detail = JSON.parse(e.target.dataset.detail);
                  console.log("🔍 子チェックボックス:", kind, detail, "checked:", e.target.checked);
                  setCheck(kind, detail);  // 第3引数なし → 反転動作
                }
              }
            };

            ip_parent.addEventListener("click", handleCheckboxClick);
            ip_parent._clickListenerFunc = handleCheckboxClick;  // 参照を保存


        }
      }



    }
    // コンポーネントがマウント（DOMに配置）された後に実行
    console.log("DOM is ready!");

    // 必要であればここでDOM操作や初期化を行う
  }, [data,flag,agencyValue]); // agencyValue が変わったときにも実行
  // 動的ストア作成関数
  return (
        <div name="layer" style={{backgroundColor:"white",maxHeight:"500px",overflowY:"auto",padding:"10px"}}>
        <fieldset>
          <legend>メッシュ単位</legend>

          <div>
            <input type="radio" id="scales" value="250" name="scale" checked onChange={(e)=>setDimention(e.target.value)}/>
            <label for="scales">250m</label>
          </div>

          <div>
            <input type="radio" id="horns" value="125" name="scale" onChange={(e)=>setDimention(e.target.value)}/>
            <label for="horns">125m</label>
          </div>
        </fieldset>
          <details ref={areaRef} name="area"><summary>区域</summary></details>

          <details name="road" ref={roadRef}><summary>道路</summary></details>

          <details name="railline" ref={raillineRef}><summary>鉄道</summary></details>

          <details name="station" ref={railstopRef}><summary>駅</summary></details>

          <details name="tram" ref={tramRef}><summary>路面電車</summary></details>
          <details name="rosenbus" ref={buslineRef}><summary>路線バス</summary></details>
          <details name="highwaybus" ref={highwaybusRef}><summary>高速バス</summary></details>

          <details name="busstop" ref={busstopRef}><summary>バス停</summary></details>

          <details name="popmesh" ref={popmeshRef}>
            <summary>人口メッシュ</summary>
            <select
              value={popcurrent}
              defaultValue={Object.values(pop)[0]}
              onChange={(e) => {console.log(e.target.value);selectpop(e.target.value);setpopcurrent(e.target.value)}}
              ref={selectpopRef}
              style={{width:'100px',height:'40px'}}
            >
              <option>年度選択</option>

              {Object.entries(pop).map(([key, value])=>(
                <option key={key} value={value}>
                  {key}
                </option>
              ))}
            </select>
          </details>
          <details name="facility" ref={facilityRef}><summary>施設</summary></details>

          <details name="spatialbuffer" ref={spatialbufferRef}><summary>空間的空白</summary></details>


          <details name="frequency" ref={frequencyRef}><summary>リンク間運行本数</summary></details>

          <details name="lipt" ref={liptRef}><summary>公共交通の期待待ち時間(lipt)</summary></details>

          <details name="ridingtime_direct" ref={traveltimedirectRef}><summary>所要時間(直通)</summary>
          </details>

          <details name="fare_direct" ref={faredirectRef}><summary>運賃(直通)</summary></details>
          <details name="ridingtime_transit" ref={traveltimetransitRef}><summary>所要時間(乗継)</summary></details>

          <details name="fare_transit" ref={faretransitRef}><summary>運賃(乗継)</summary></details>
          <details name="transfer" ref={transfertransitRef}><summary>乗継回数</summary></details>

        </div>
           )
          }
export default spatiallayerchecked;
