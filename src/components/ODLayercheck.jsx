
import React, {useReducer,useStatem,createElement} from 'react'
import { useContext,useMemo,useRef,useEffect,useState} from "react";

import { initialCheck } from "./Globalvariable";
import { useDataStore,useCheckStore} from "./useStore";


const ODLayercheck = () => {
  const odpathRef =useRef();
  const odmeshRef =useRef();
  const reflist=[odpathRef,odmeshRef
  ]
  const data = useDataStore((state) => state.data);
  const check = useCheckStore((state) => state.Checklist);
  const setCheck = useCheckStore((state) => state.setChecklist);
  const setFlag = useDataStore((state) => state.setCheck);
  const agencyValue = useDataStore((state) => state.agencyValue);
  
    useEffect(() => {
      const ip=document.getElementById("layer");
      let data0={}
      console.log(data);
      for (let v in data){
        // 1. JSON文字列に変換してSetに入れ、重複を除去
        const uniqueSet = new Set(data[v].map(arr => JSON.stringify(arr)));
  
        // 2. 文字列を配列に戻す
        const uniqueArray = Array.from(uniqueSet).map(str => JSON.parse(str));
        v=uniqueArray;
      }
      for (const f of reflist){
        for (const [k, v] of Object.entries(data)){
          const ip_label=document.createElement("label");
          ip_label.innerText=v;
          let l=0;
          const div=document.createElement("div");
          const br=document.createElement("br");
          console.log(k,v,f.current.name);
          if (k===f.current.name){
              const ip_parent=f.current;
              console.log(k);


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
                      v.filter(item => item[3] === agency)
                    ])
                  )
                : {};
              const ungroupedItems = agencyValue.length > 0
                ? v.filter(item => !agencyValue.includes(item[3]))
                : v;

              console.log(`📊 [${k}] agencyValue: ${JSON.stringify(agencyValue)}, グループ: ${Object.keys(groupedByAgency).length}, グループなし: ${ungroupedItems.length}`);

              // ★グルーピングされたアイテム：親子チェックボックスを作成
              for (const [agencyName, items] of Object.entries(groupedByAgency)) {
                // ★子が0件の場合はスキップ（該当しない親チェックボックスを作らない）
                if (items.length === 0) {
                  continue;
                }
                console.log(`👨‍👩‍👧‍👦 親チェックボックス作成: ${agencyName} (${items.length}件)`);

                const agencyKey = `${k}_${agencyName}`;

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
                childrenContainer.dataset.agencyContainer = `${k}_${agencyName}`;
                childrenContainer.style.display = "block";  // デフォルト展開

                // ★子チェックボックス：各ルート
                for (const k1 of items) {
                  let label;
                  let detail;
                  try{
                    // GeoJSON の detail フィールドから取得
                    const geojson = k1[k][2];
                    if (geojson && geojson.features && geojson.features.length > 0) {
                      label = geojson.features[0].properties?.detail || k1[k][0];
                    } else {
                      label = k1[k][0];
                    }
                    detail = k1[k][0];
                  } catch {
                    label = k1[0];
                    detail = k1[0];
                  }

                  if (existingLabels.has(label)) {
                    continue;
                  }

                  const ip_child = document.createElement("input");
                  const ip_child_label = document.createElement("label");
                  const item_br = document.createElement("br");
                  ip_child.type = "checkbox";
                  ip_child.name = k;
                  ip_child.id = label;
                  ip_child.style.marginRight = "5px";
                  ip_child.style.marginLeft = "30px";
                  ip_child_label.style.marginRight = "10px";
                  ip_child_label.style.cursor = "pointer";
                  ip_child_label.style.fontSize = "14px";
                  ip_child.checked = k1[1];
                  console.log(`📋 [${k}] ${label}: k1=${JSON.stringify(k1)}, checked=${ip_child.checked}`);
                  ip_child_label.textContent = label;

                  // ★イベント委譲用：data属性にkind, detail, agencyを保存
                  ip_child.dataset.kind = k;
                  ip_child.dataset.detail = JSON.stringify(detail);
                  ip_child.dataset.agency = agencyName;

                  // ★子チェックボックスをコンテナに追加
                  childrenContainer.appendChild(ip_child);
                  childrenContainer.appendChild(ip_child_label);
                  childrenContainer.appendChild(item_br);

                  existingLabels.add(label);
                }

                // ★コンテナを親要素に追加
                ip_parent.appendChild(childrenContainer);
                existingLabels.add(agencyKey);
              }

              // ★グルーピングなしのアイテム：子チェックボックスのみ作成（親なし）
              for (const k1 of ungroupedItems) {
                let detail;
                let label;
                try{
                  // GeoJSON の detail フィールドから取得
                  const geojson = k1[k][2];
                  if (geojson && geojson.features && geojson.features.length > 0) {
                    label = geojson.features[0].properties?.detail || k1[k][0];
                  } else {
                    label = k1[k][0];
                  }
                  detail = k1[k][0];
                } catch {
                  label = k1[0];
                  detail = k1[0];
                }

                if (existingLabels.has(label)) {
                  continue;
                }

                const ip_child = document.createElement("input");
                const ip_child_label = document.createElement("label");
                const item_br = document.createElement("br");
                ip_child.type = "checkbox";
                ip_child.name = k;
                ip_child.id = label;
                ip_child.style.marginRight = "5px";
                ip_child_label.style.marginRight = "10px";
                ip_child_label.style.cursor = "pointer";
                ip_child.checked = k1[1];
                console.log(`📋 [${k}] ${label}: k1=${JSON.stringify(k1)}, checked=${ip_child.checked}`);
                ip_child_label.textContent = label;

                ip_child.dataset.kind = k;
                ip_child.dataset.detail = JSON.stringify(detail);

                ip_parent.appendChild(ip_child);
                ip_parent.appendChild(ip_child_label);
                ip_parent.appendChild(item_br);

                existingLabels.add(label);
              }

              // ★イベント委譲：親要素にリスナーを1つ付ける
              if (!ip_parent._hasCheckListener) {
                ip_parent.addEventListener("click", (e) => {
                  if (e.target.type === "checkbox") {
                    // ★親チェックボックスの場合：配下の子をすべてチェック/アンチェック
                    if (e.target.dataset.isParent === "true") {
                      const agency = e.target.dataset.agency;
                      const children = ip_parent.querySelectorAll(`input[data-agency="${agency}"]:not([data-isParent])`);
                      children.forEach(cb => {
                        cb.checked = e.target.checked;
                        // ★配下の子すべてに setCheck を実行
                        if (cb.dataset.kind && cb.dataset.detail) {
                          const kind = cb.dataset.kind;
                          const detail = JSON.parse(cb.dataset.detail);
                          setCheck(kind, detail);
                          setFlag(kind, detail);
                        }
                      });
                      console.log(`✅ 親チェックボックス [${agency}] が ${e.target.checked ? "ON" : "OFF"}`);
                    } else {
                      // ★子チェックボックスの場合：setCheck を実行
                      const kind = e.target.detail;
                      const detail = JSON.parse(e.target.detail);
                      console.log("🔍 子チェックボックス:", kind, detail, "checked:", e.target.checked);
                      setCheck(kind, detail);
                      setFlag(kind, detail);
                    }
                  }
                });
                ip_parent._hasCheckListener = true;
              }

          }
        }
        
        
        
      }
      // コンポーネントがマウント（DOMに配置）された後に実行
      console.log("DOM is ready!");

      // 必要であればここでDOM操作や初期化を行う
    }, [data, agencyValue]); // data または agencyValue が変わったら再実行
    // 動的ストア作成関数
  return (
        <div name="layer">
          <details ref={odpathRef} name="od_visual"><summary>ODパス表示</summary></details>
          <details ref={odmeshRef} name="odmesh_visual"><summary>ODメッシュ表示</summary></details>
        </div>
           )
          }
export default ODLayercheck;