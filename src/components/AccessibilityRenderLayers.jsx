import React from 'react';
import { useMemo, useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import Map from 'react-map-gl/mapbox';
import EditLine from './EditLine';
import { mapboxAccessToken, mapstyle,initialCheck,vividColors } from "./Globalvariable";
import {useHoverStore,useLegendStore,useStaycheckStore,useFlagStore,useOrigDestStore,useDirectStore,useLayerflagStore,usePopStore,usePopmeshStore,useEditStore,useAreaStore,useViewAccesibilityStore,useLayercheckStore,useClickmeshStore,useDestStore,useWeekdayStore,useKindStore,useFareStore,useClickareaStore,useTimesliderStore,useGetboundaryStore,useClicklanduseStore,useClickplanningareaStore,useDataStore,useColorareaStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestraillineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore} from "./useStore";
const UpdateLayers = () => {
  const pointkind=["facility","railstop","busstop","elevation"];
  const linekind=["od_visual","frequency_on_routes","editline","road","railline","tram","highwaybus","area"];
  const meshkind=["popmesh","lipt"];
  const flagcheck=useFlagStore((state) => state.flagcheck);
  const setLegends = useLegendStore((state) => state.setLegends);
  const origdest=useDirectStore((state)=> state.sorig)
  const [selected, setSelected] = useState(false)
  const color_l=[];
  const setArea_list = useColorareaStore((state) => state.setColorarea);
  const viewAccessibility=useViewAccesibilityStore((state) => state.select);
  const staycheck=useStaycheckStore((state) => state.staycheck);
  const setviewAccessibility=useViewAccesibilityStore((state) => state.selectView);
  //const bounds = viewport.getBounds()
  // → [西経, 南緯, 東経, 北緯]  [minLng, minLat, maxLng, maxLat]
  //const [minLng, minLat, maxLng, maxLat] = bounds
  const hover=useHoverStore((state)=>state.select);
  const weekday =useWeekdayStore((state)=>state.select);
  const weekdayflag =useWeekdayStore((state)=>state.selectflag);
  const dest =useDestStore((state)=>state.select);
  const direct=useDirectStore((state)=> state.direct);
  const pop = usePopStore((state)=>state.pop);
  const time = useTimesliderStore((state)=>state.time);
  const area = useAreaStore((state)=>state.area);
  const kind = useKindStore((state)=>state.select);
  const data = useDataStore((state)=>state.data);
  const popmesh = usePopmeshStore((state)=>state.popmesh);
  const flag = useFlagStore((state) => state.flag);
  const [address,setAddress]=useState("None");
  const layercheck=useLayercheckStore((state)=> state.select);
  const setFare = useFareStore((state) => state.setFare);
  const setRidingtime=useDataStore((state) => state.setRidingtime);
  const setRidingtimeall=useDataStore((state) => state.setRidingtimeall);
  const ridingtime=useDataStore((state) => state.ridingtime);
  const dimention=useDataStore((state) => state.dimention);
  const setClickedareaaddress = useClickareaStore((state) => state.setClickareaaddress);
  const setClickedlanduse = useClicklanduseStore((state) => state.setClicklanduse);
  const setClickedplanningarea = useClickplanningareaStore((state) => state.setClickplanningarea);
  const setClickedareapop = useClickareaStore((state) => state.setClickareapop);
  const setClickedareahousehold = useClickareaStore((state) => state.setClickareahousehold);
  const setClickedareapopdensity = useClickareaStore((state) => state.setClickareapopdensity);
  const setClickneareststop = useClickneareststopStore((state) => state.setClickneareststop);
  const setClickpopmesh = useClickmeshStore((state) => state.setClickmeshpop);
  const setClickpopmeshaddress = useClickmeshStore((state) => state.setClickmeshaddress);
  const setClickstop = useClickstopStore((state) => state.setClickstop);
  const setFacility = useClickneareststopStore((state) => state.setFacility);
  const setClicknearestbusline = useClicknearestbuslineStore((state) => state.setClicknearestbusline);
  const setClicknearestridetime = useClicknearestridetimeStore((state) => state.setClicknearestridetime);
  const setClicknearestgetofftime = useClicknearestgetofftimeStore((state) => state.setClicknearestgetofftime);
  const setBoundary = useGetboundaryStore((state) => state.setBoundary);
  const setClicknearestrailline=useClicknearestraillineStore((state) => state.setClicknearestrailline);
  
  const origdestR=useOrigDestStore(state => state.origdest)
  const mergeGeoJSON = (geoJsonArray) => ({
    type: "FeatureCollection",
    features: geoJsonArray.flatMap(gj => gj.features)
  });
  let allFeatures =[];
  for (let j in popmesh){
    allFeatures.push(popmesh[j]["data"])

  }
      // AccessibilityRenderLayers.jsxの最初の方に追加

    const generateLegendData = (kind,staycheck) => {
      const legendData = [];

      if (staycheck === "nostay"&&kind === "所要時間") {
        // 0-60分は10分刻み
        [0, 10, 20, 30, 40, 50, 60].forEach(minutes => {
          const seconds = minutes * 60;
          const r = Math.max(0, Math.min(255, 255 - (seconds / 10)));
          const g = 255;
          const b = Math.max(0, Math.min(255, seconds / 10));
          legendData.push([[Math.round(r), Math.round(g), Math.round(b)], minutes]);
        });
        // 60分以上は30分刻み
        [90, 120].forEach(minutes => {
          const seconds = minutes * 60;
          const r = Math.max(0, Math.min(255, 255 - (seconds / 10)));
          const g = 255;
          const b = Math.max(0, Math.min(255, seconds / 10));
          legendData.push([[Math.round(r), Math.round(g), Math.round(b)], minutes]);
        });
      } else if (staycheck === "nostay"&&kind === "運賃") {
        // 運賃：0～1200円を200円刻み
        [0, 200, 400, 600, 800, 1000, 1200].forEach(fare => {
          const r = Math.max(0, Math.min(255, Math.floor((fare / 1000) * 135)));
          const g = Math.max(0, Math.min(255, Math.floor((fare / 1000) * 196)));
          const b = 255;
          legendData.push([[r, g, b], fare]);
        });
      } else if (staycheck === "nostay"&&kind === "運行本数") {
        // 運行本数：0～20本を5本刻み
        [0, 5, 10, 15, 20].forEach(freq => {
          const r = 0;
          const g = Math.max(0, Math.min(153, 153 - Math.floor((freq * 153) / 5)));
          const b = Math.max(0, Math.min(204, 204 - Math.floor((freq * 204) / 5)));
          legendData.push([[r, g, b], freq]);
        });
      } else if (staycheck === "stay") {
      [3600, 3600*1, 3600*2, 3600*3, 3600*4, 3600*5, 3600*6, 3600*7, 3600*8, 3600*9, 3600*10, 3600*11, 3600*12, 3600*13,, 3600*14, 3600*15, 3600*16].forEach(minutes => {
        const seconds = minutes;
        console.log(seconds);
        const r = Math.max(0, Math.min(255, (seconds / 43200) * 255));
        const g = 0;
        const b = Math.max(0, Math.min(255, 255 - (seconds / 43200) * 255));
        legendData.push([[Math.round(r), Math.round(g), Math.round(b)], minutes]);
      });
      }
      return legendData;
    };

    // kindが変わったときに呼ぶ
    useEffect(() => {
      if (kind||staycheck) {
        const legendData = generateLegendData(kind,staycheck);
        setLegends(legendData);
      }
    }, [kind, setLegends,staycheck]);
  const result = mergeGeoJSON(allFeatures);
  const ridingtimerow = useMemo(()=>{
    let layers_ridingrow=[]
  let i=0
  let s = dest;
  let s0 = weekday;
  let s1 = parseInt(Math.round(time*100000000)+10);
    console.log(s1,dest,weekday);
  let s2="direct";
  let s02=parseInt(weekdayflag)-1;
  let directtransit=["direct","transit"];
  let origdest0=["orig","dest"];
    // 例: check配列の中にこのレイヤー名が含まれているか確認
    // 都市計画では「表示/非表示」の切り替えが頻繁なのでここで制御
    //const isVisible = check.includes(d.property.name); 
  let flagall=[]
  console.log(origdestR);
  let d=`ridingtime_direct_${origdestR}`
  console.log(data,dest)
  
  if (data[d]!=null&&time!=""&&dest!=""&&weekday!=""){
    if (staycheck==="nostay"){
      if (direct=="direct"){
        for (const [key, d1] of Object.entries(data[d])){
          i+=1
          if(d1["detail"].includes(dest)){
            console.log(d1)
            
            const Area =area;
            const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}`:`layer-${d}-${d1["detail"]}-${i}`;
            let flag=[];
            if(layercheck!="複数レイヤー表示"){
              d1.hasOwnProperty(d)?flagall.push(d1[d]["data"]):flagall.push(d1["data"]);

            
              for (const k of flagall){
                console.log(dest)
                if (k.length>=1)
                {
                  if (origdestR=="dest"&&k[0]["condition"].hasOwnProperty("to")&&k[0]["condition"]["to"]==dest){
                    flag=k;
                  } else if (origdestR=="orig"&&k[0]["condition"].hasOwnProperty("from")&&k[0]["condition"]["from"]==dest){
                    flag=k;
                  }

                } else{
                    
                  if (origdestR=="dest"&&k["condition"].hasOwnProperty("to")&&k["condition"]["to"]==dest){
                    flag=k;
                  } else if (origdestR=="orig"&&k["condition"].hasOwnProperty("from")&&k["condition"]["from"]==dest){
                    flag=k;
                  }
                }
              }
            } else{
              d1.hasOwnProperty(d)?flag=d1[d]["data"]:flag=d1["data"];
            }
            const data1r = (() => {
            // ステップ1: flagデータをオブジェクトで事前処理
            let flagMap = {};
            let key="";
            for (const i of flag) {
              if (i["condition"]["weekday"][s02] === "1" && i["condition"]["hour"]==s1&&
                  i["condition"]["direct"] === "direct") {
                
                key = origdestR=="dest"?`${i["condition"]["weekday"]}_${i["condition"]["hour"]}_${i["condition"]["to"]}`:`${i["condition"]["weekday"]}_${i["condition"]["hour"]}_${i["condition"]["from"]}`;
                console.log(key)
                // meshIdMap を作成
                const meshIdMap = {};
                i["data"].forEach((item, idx) => {
                  if (item.directmeshid && Array.isArray(item.directmeshid)) {
                    item.directmeshid.forEach(meshId => {
                      meshIdMap[meshId] = idx;
                    });
                  }
                });
                // 複数データに対応：配列にする
                if (!flagMap[key]) {
                  flagMap[key] = [];
                }
                flagMap[key].push({
                  condition: i["condition"],
                  data: i["data"],
                  meshIdMap: meshIdMap
                });
              }
            }
            // ステップ2: result.features を処理
            // 使用時：配列から全データを取得
            return result.features
              .map((e) => {;
                  let key0=key;
                  const flagDataArray = flagMap[key0];  // 配列
                // プロパティ初期化
                origdestR=="dest"?e.properties["to"] = null:e.properties["from"] = null;
                e.properties["weekday"] = null;
                e.properties["hour"] = null;
                e.properties["direct"] = null;
                e.properties["directrideonstop"] = null;
                e.properties["directgetoffstop"] = null;
                e.properties["directridingtime"] = null;
                e.properties["directrideontime"] = null;
                e.properties["directgetofftime"] =[];
                e.properties["directexceptionserviceday"] = null;
                e.properties["directroute"] = null;
                e.properties["directagency"] = null;
                e.properties["directdimention"] = null;
                if (flagDataArray) {
                  // 配列の全データを検索
                  for (const flagData of flagDataArray) {
                    let idx=null
                    if ("KEY_CODE" in e.properties){
                      idx= flagData.meshIdMap[e.properties["KEY_CODE"]];

                    } else {
                      idx= flagData.meshIdMap[e.properties["MESH_ID"]];

                    }
                    if (idx !== undefined) {
                    const item = flagData.data[idx];
                    if (origdestR=="dest"){
                      e.properties["to"] = flagData.condition["to"];
                    } else {
                      e.properties["from"] = flagData.condition["from"];
                    }
                    e.properties["weekday"] = flagData.condition["weekday"];
                    e.properties["hour"] = flagData.condition["hour"];
                    e.properties["direct"] = flagData.condition["direct"];
                    e.properties["dimention"] = flagData.condition["dimention"];
                    e.properties["directrideonstop"] = item.directrideonstop;
                    e.properties["directgetoffstop"] = item.directgetoffstop;
                    e.properties["directridingtime"] = item.directridingtime;
                    e.properties["directrideontime"] = item.directrideontime;
                    e.properties["directgetofftime"] = item.directgetofftime;
                    e.properties["directexceptionserviceday"] = item.directexceptionserviceday;
                    e.properties["directroute"] = item.directroute;
                    e.properties["directagency"] = item.directagency;
                      // ... その他のプロパティ
                      break;  // 最初にマッチしたら終了
                    }
                  }
                }

                return e;
              })
              .filter((e) => {
                return e.properties["hour"] == parseInt(s1);
              });
            })();
            console.log(data1r);
              
              //&&bounds[0] <= x1 && x2 <= bounds[2] && bounds[1] <= y1 && y2 <= bounds[3]
            const filteredGeoJSON = {
              type: "FeatureCollection",
              features: data1r
            };
            setRidingtime(data1r);
            //setRidingtimeall(data2r);
            let datav=d1["checked"];
            const isActive =layercheck === "タイムスライダー"?true:datav;
            const dest00=d1.hasOwnProperty(d)?d1[d]["point"]:d1["point"];
            let ratiolist=[];
            let valuelist=[];
            const layer={
              id: ly,
              type: 'fill',
              sourceData: filteredGeoJSON,
              paint: {
              'fill-color': [
                'rgb',
                ['max', 0, ['min', 255, ['-', 255, ['/', ['to-number', ['get', 'directridingtime']], 10]]]],
                255,
                ['max', 0, ['min', 255, ['/', ['to-number', ['get', 'directridingtime']], 10]]]
              ],
                'fill-opacity': 1
              },
              layout: {},
              visible: layercheck === "タイムスライダー"&&staycheck==="nostay"?true:false,
              hoverType: "所要時間",
              clickHandler: (feature) => {
                try{
                  console.log('Clicked:',feature.properties[s0]);
                  setClicknearestridetime(feature.properties[s0]);
                  setClicknearestgetofftime(feature.properties[s1]);
                  setClickneareststop(feature.properties[stop]);
                  setClicknearestbusline(feature.properties["route"]);
                  console.log('Clicked:',feature.properties[Area]);
                  setClickpopmeshaddress(feature.properties[Area]);
                } catch(e){
                  console.log(e.message);
                }
              }
            };
            layers_ridingrow.push(layer);
            
            console.log(d1)
            let point=d1.hasOwnProperty(d)?d1[d]["point"]:d1["point"];
            let data1p=[];
            for (const k of point){
              data1p.push({"name":k["stopname"],"coordinates":[k["stoplon"],k["stoplat"]]})
            }
            console.log(data1p);
            const ly1=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}`:`layer-${d}-${d1["detail"]}-${i+5}`;
            const dest0=d1.hasOwnProperty(d)?d1[d]["point"]:d1["point"];
            const layerpoint={
              id: ly1,
              type: 'symbol',
              sourceData: {
                type: 'FeatureCollection',
                features: data1p.map((d, idx) => ({
                  type: 'Feature',
                  properties: { name: d.name },
                  geometry: { type: 'Point', coordinates: d.coordinates }
                }))
              },
              layout: {
                'icon-image': 'marker',
                'icon-size': ['interpolate', ['linear'], ['zoom'], 0, 0.1, 24, 0.1]
              },
              paint: {},
              visible: layercheck === "タイムスライダー"&&dest0==dest?true:false,
              hoverType: "所要時間",
              clickHandler: (feature) => {}
            };
            layers_ridingrow.push(layerpoint);
            const ly2=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}`:`layer-${d}-${d1["detail"]}-${i*5+100}`;
            const dest01=d1.hasOwnProperty(d)?d1[d]["point"]:d1["point"];
            const layertextpoint={
              id: ly2,
              type: 'symbol',
              sourceData: {
                type: 'FeatureCollection',
                features: data1p.map((d, idx) => ({
                  type: 'Feature',
                  properties: { name: d.name },
                  geometry: { type: 'Point', coordinates: d.coordinates }
                }))
              },
              layout: {
                'text-field': ['get', 'name'],
                'text-size': 25,
                'text-anchor': 'center',
                'text-offset': [0, -2.2]
              },
              paint: {
                'text-color': '#010166'
              },
              visible: layercheck === "タイムスライダー"&&dest01==dest?true:false,
              hoverType: "所要時間",
              clickHandler: (feature) => {}
            };
            layers_ridingrow.push(layertextpoint);
          
          } 
        
        }
      } else {
        for(const d3 of origdest0){
          let d=`ridingtime_transit_${d3}`
          if (data[d]!=null&&time!=""&&dest!=""&&weekday!=""){
            for (const [key, d1] of Object.entries(data[d])){
              const Area =area;
              let s = dest;
              let s0 = weekday;
              let s1 = parseInt(Math.round(time*100000000)+10);
              let s02=parseInt(weekdayflag)-1;
              const lyd=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}1`:`layer-${d}-${d1["detail"]}-${i}1`;
              const lyb=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}b`:`layer-${d}-${d1["detail"]}-${i}b`;
              let flag=[];
              if(layercheck!="複数レイヤー表示"){
              d1.hasOwnProperty(d)?flagall.push(d1[d]["data"]):flagall.push(d1["data"]);

              
              for (const k of flagall){
                if (k.length>=1)
                {
                  if (k[0]["condition"]["to"]==dest){
                    flag=k;
                  }

                } else{
                    if (k["condition"]["to"]==dest){
                    flag=k;
                  }
                }
              }
            } else{
              flag=d1.hasOwnProperty(d)?d1[d]["data"]:d1["data"];
            }
            const data1b= (() => {
              // ステップ1: flagデータをオブジェクトで事前処理
              let flagMap = {};
              let key="";
              for (const i of flag) {
                if (i["condition"]["weekday"][s02] === "1" && i["condition"]["hour"]==s1&&
                    i["condition"]["direct"] === "before") {
                  
                  key = i["condition"].hasOwnProperty("to")?`${i["condition"]["weekday"]}_${i["condition"]["hour"]}_${i["condition"]["to"]}`:`${i["condition"]["weekday"]}_${i["condition"]["hour"]}_${i["condition"]["from"]}`;
                  
                  // meshIdMap を作成
                  const meshIdMap = {};
                  i["data"].forEach((item, idx) => {
                    if (origdest==="dest"&&item.beforemeshid && Array.isArray(item.beforemeshid)) {
                      item.beforemeshid.forEach(meshId => {
                        meshIdMap[meshId] = idx;
                      });
                    } else if (origdest==="orig"&&item.aftermeshid && Array.isArray(item.aftermeshid)) {
                      item.aftermeshid.forEach(meshId => {
                        meshIdMap[meshId] = idx;
                      });
                    }
                  });
                  // 複数データに対応：配列にする
                  if (!flagMap[key]) {
                    flagMap[key] = [];
                  }
                  flagMap[key].push({
                    condition: i["condition"],
                    data: i["data"],
                    meshIdMap: meshIdMap
                  });
                }
              }
              // ステップ2: result.features を処理
              // 使用時：配列から全データを取得
              return result.features
                .map((e) => {;
                  let key0=key;
                  const flagDataArray = flagMap[key0];  // 配列
                  // プロパティ初期化
                  e.properties["to"] = null;
                  e.properties["weekday"] = null;
                  e.properties["hour"] = null;
                  e.properties["beforerideonstop"] = null;
                  e.properties["beforegetoffstop"] = null;
                  e.properties["beforeridingtime"] = null;
                  e.properties["beforerideontime"] = null;
                  e.properties["beforegetofftime"] =[];
                  e.properties["beforeexceptionserviceday"] = null;
                  e.properties["beforeroute"] = null;
                  e.properties["beforeagency"] = null;
                  e.properties["beforedimention"] = null;

                  e.properties["afterrideonstop"] = null;
                  e.properties["aftergetoffstop"] = null;
                  e.properties["afterridingtime"] = null;
                  e.properties["afterrideontime"] = null;
                  e.properties["aftergetofftime"] =[];
                  e.properties["afterexceptionserviceday"] = null;
                  e.properties["afterroute"] = null;
                  e.properties["afteragency"] = null;
                  e.properties["afterdimention"] = null;
                  if (flagDataArray) {
                    // 配列の全データを検索
                    for (const flagData of flagDataArray) {
                      const idx = flagData.meshIdMap[e.properties["KEY_CODE"]];
                      
                      if (idx !== undefined) {
                      const item = flagData.data[idx];
                      e.properties["to"] = flagData.condition["to"];
                      e.properties["weekday"] = flagData.condition["weekday"];
                      e.properties["hour"] = flagData.condition["hour"];
                      e.properties["before"] = flagData.condition["before"];
                      e.properties["dimention"] = flagData.condition["dimention"];
                      origdest==="dest"?e.properties["beforerideonstop"] = item.beforerideonstop:e.properties["afterrideonstop"] = item.afterrideonstop;
                      origdest==="dest"?e.properties["beforegetoffstop"] = item.beforegetoffstop:e.properties["aftergetoffstop"] = item.aftergetoffstop;
                      origdest==="dest"?e.properties["beforeridingtime"] = item.beforeridingtime:e.properties["afterridingtime"] = item.afterridingtime;
                      origdest==="dest"?e.properties["beforerideontime"] = item.beforerideontime:e.properties["afterrideontime"] = item.afterrideontime;
                      origdest==="dest"?e.properties["beforegetofftime"] = item.beforegetofftime:e.properties["aftergetofftime"] = item.aftergetofftime;
                      origdest==="dest"?e.properties["beforeexceptionserviceday"] = item.beforeexceptionserviceday:e.properties["afterexceptionserviceday"] = item.afterexceptionserviceday;
                      origdest==="dest"?e.properties["beforeroute"] = item.beforeroute:e.properties["afterroute"] = item.afterroute;
                      origdest==="dest"?e.properties["beforeagency"] = item.beforeagency:e.properties["afteragency"] = item.afteragency;
                        // ... その他のプロパティ
                        break;  // 最初にマッチしたら終了
                      }
                    }
                  }

                  return e;
                })
                .filter((e) => {
                  return e.properties["hour"] == parseInt(s1) && 
                        e.properties["beforeridingtime"] >= 60;
                });
            })();
            
            const beforeGeoJSON = {
              type: "FeatureCollection",
              features: data1b
            };
            //setRidingtime(directGeoJSON);
              const bisv=d1.hasOwnProperty(d)?d1[d]["checked"]:d1["checked"];
              const bisLayer = layercheck === "複数レイヤー表示"?true:false;
              const bisActive = kind === "所要時間"?true:false;
              
              let bratiolist=[];
              let bvaluelist=[];
              const blayer={
                id: lyb,
                type: 'fill',
                sourceData: beforeGeoJSON,
                paint: {
                  'fill-color':origdest==="dest"? [
                    'case',
                    ['>=', ['get', 'beforeridingtime'], 60],
                    [
                      'rgb',
                      ['max', 0, ['min', 255, ['-', 255, ['/', ['to-number', ['get', 'beforeridingtime']], 10]]]],
                      255,
                      ['max', 0, ['min', 255, ['/', ['to-number', ['get', 'beforeridingtime']], 10]]]
                    ],
                    'rgba(0, 0, 0, 0)'
                  ]:[
                    'case',
                    ['>=', ['get', 'afterridingtime'], 60],
                    [
                      'rgb',
                      ['max', 0, ['min', 255, ['-', 255, ['/', ['to-number', ['get', 'afterridingtime']], 10]]]],
                      255,
                      ['max', 0, ['min', 255, ['/', ['to-number', ['get', 'afterridingtime']], 10]]]
                    ],
                    'rgba(0, 0, 0, 0)'
                  ],
                  'fill-opacity': 1,
                  'fill-outline-color': '#170d0d'  // 白い枠線
                },
                layout: {},
                visible: layercheck === "複数レイヤー表示"?bisv:false,
                hoverType: "所要時間"
              };
            layers_ridingrow.push(blayer);
            const data1d = result.features
            .map((e) => {
              // プロパティ初期化
              e.properties["to"] = null;
              e.properties["weekday"] = null;
              e.properties["hour"] = null;
              e.properties["direct"] = null;
              e.properties["directrideonstop"] = [];
              e.properties["directgetoffstop"] = [];
              e.properties["directridingtime"] = [];
              e.properties["directrideontime"] = [];
              e.properties["directgetofftime"] =[];
              e.properties["directexceptionserviceday"] = [];
              e.properties["directroute"] = [];
              e.properties["directagency"] = [];
              e.properties["directdimention"] = [];
              for (const i1 of flag) {
                let obj=i1["data"];
                for(let l in Object.values(obj)){
                  let flagb=[];
                  for (let l1 in Object.values(obj)[l]){
                    for (let k in Object.values(obj)[l][l1].directmeshid){
                      flagb.push(Object.values(obj)[l][l1].directmeshid[k])
                      }
                  }
                  let rideonstop=Object.values(obj).map(u=>u.rideonstop);
                  let getoffstop=Object.values(obj).map(u=>u.getoffstop);
                  let ridingtime=Object.values(obj).map(u=>u.ridingtime);
                  let rideontime=Object.values(obj).map(u=>u.rideontime);
                  let getofftime=Object.values(obj).map(u=>u.getofftime);
                  let exceptionserviceday=Object.values(obj).map(u=>u.exceptionserviceday);
                  let route=Object.values(obj).map(u=>u.route);
                  let agency=Object.values(obj).map(u=>u.agency);
                  let flag0b=flagb
                  let index=flag0b.findIndex(row => row.includes(e.properties["MESH_ID"]));
                    
                  if (index!=-1){
                      e.properties["to"] = i1["condition"]["to"];
                      e.properties["weekday"] = i1["condition"]["weekday"];
                      e.properties["hour"] = i1["condition"]["hour"];
                      e.properties["direct"] = i1["condition"]["direct"];
                      e.properties["directrideonstop"]=rideonstop[index];
                      e.properties["directgetoffstop"]=getoffstop[index];
                      e.properties["directridingtime"]=ridingtime[index];
                      e.properties["directrideontime"]=rideontime[index];
                      e.properties["directgetofftime"]=getofftime[index];
                      e.properties["directexceptionserviceday"]=exceptionserviceday[index]; // = に修正
                      e.properties["directroute"]=route[index]; // = に修正
                      e.properties["directagency"]=agency[index]; // = に修正
  
                  }  
                }    
                
              }

            
              return e;
            }).filter((e)=>{return e.properties["to"]!=null})
            //&&bounds[0] <= x1 && x2 <= bounds[2] && bounds[1] <= y1 && y2 <= bounds[3]
            const directGeoJSON = {
              type: "FeatureCollection",
              features: data1d
            };
            const mergedGeoJSON = {
              type: "FeatureCollection",
              features: [...directGeoJSON.features, ...beforeGeoJSON.features]
            };
            setRidingtime(mergedGeoJSON);
              const isv=d1.hasOwnProperty(d)?d1[d]["checked"]:d1["checked"];
              const isLayer = layercheck === "複数レイヤー表示"?true:false;
              const isActive = kind === "所要時間"?true:false;
              
              let ratiolist=[];
              let valuelist=[];
              const layer={
                id: lyd,
                type: 'fill',
                sourceData: directGeoJSON,
                paint: {
                  'fill-color': [
                    'case',
                    ['==', ['get', 'layercheck'], '複数レイヤー表示'],
                    '#008080',
                    '#00ff00'
                  ],
                  'fill-opacity': 1
                },
                layout: {},
                visible: layercheck === "複数レイヤー表示"?isv:false,
                hoverType: "所要時間",
                clickHandler: (feature) => {
                  try{
                    console.log('Clicked:',feature.properties[s0]);
                    setClicknearestridetime(feature.properties[s0]);
                    setClicknearestgetofftime(feature.properties[s1]);
                    setClickneareststop(feature.properties[stop]);
                    setClicknearestbusline(feature.properties["route"]);
                    console.log('Clicked:',feature.properties[Area]);
                    setClickpopmeshaddress(feature.properties[Area]);
                  } catch(e){
                    console.log(e.message);
                  }
                }
              };


              const point=d1.hasOwnProperty(d)?d1[d]["point"]:d1["point"];
              let data1p=[];
              for (let k in point){
                data1p.push({"name":point[k]["stopname"],"coordinates":[point[k]["stoplon"],point[k]["stoplat"]]})
              }
              const isv0=d1.hasOwnProperty(d)?d1[d]["checked"]:d1["checked"];
              const ly1=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}`:`layer-${d}-${d1["detail"]}-${i+5}`;
              const layerpoint={
                id: ly1,
                type: 'symbol',
                sourceData: {
                  type: 'FeatureCollection',
                  features: data1p.map((d, idx) => ({
                    type: 'Feature',
                    properties: { name: d.name },
                    geometry: { type: 'Point', coordinates: d.coordinates }
                  }))
                },
                layout: {
                  'icon-image': 'marker',
                  'icon-size': ['interpolate', ['linear'], ['zoom'], 0, 0.1, 24, 0.1]
                },
                paint: {},
                visible: layercheck === "複数レイヤー表示"?isv0:false,
                hoverType: "所要時間",
                clickHandler: (feature) => {}
              };
              console.log(layerpoint);
              layers_ridingrow.push(layerpoint);
              const ly2=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}`:`layer-${d}-${d1["detail"]}-${i*5+100}`;
              const isv1=d1.hasOwnProperty(d)?d1[d]["checked"]:d1["checked"];
              const layertextpoint={
                id: ly2,
                type: 'symbol',
                sourceData: {
                  type: 'FeatureCollection',
                  features: data1p.map((d, idx) => ({
                    type: 'Feature',
                    properties: { name: d.name },
                    geometry: { type: 'Point', coordinates: d.coordinates }
                  }))
                },
                layout: {
                  'text-field': ['get', 'name'],
                  'text-size': 25,
                  'text-anchor': 'center',
                  'text-offset': [0, -2.2]
                },
                paint: {
                  'text-color': '#010166'
                },
                visible: layercheck === "複数レイヤー表示"?isv1:false,
                hoverType: "所要時間",
                clickHandler: (feature) => {}
              };
              console.log(layertextpoint);
              //layers_ridingrow.push(layertextpoint);
            }
          }
          }
        }    
    } else {
      if(direct==="direct"){

        let origdestpare=[];
        for (const [key, d0] of Object.entries(data["ridingtime_direct_staytime"])){
          const Area =area;
          let s = dest;
          let s0 = weekday;
          let s1 = parseInt(Math.round(time*100000000)+10);
          let s02=parseInt(weekdayflag)-1;
          console.log(result)
        const datastay = (() => {
          
          // ステップ1: flagデータをオブジェクトで事前処理
          let flagMap = {};
          let key="";
          for (const i of d0.data) {
            if (i["condition"]["weekday"][s02] === "1" && i["condition"]["hour"]==s1&&
                i["condition"]["direct"] === "direct") {
              
              key = i["condition"].hasOwnProperty("to")?`${i["condition"]["weekday"]}_${i["condition"]["hour"]}_${i["condition"]["to"]}`:`${i["condition"]["weekday"]}_${i["condition"]["hour"]}_${i["condition"]["from"]}`;
              console.log(key)
              // meshIdMap を作成
              const meshIdMap = {};
              i["data"].forEach((item, idx) => {
                if (item.directmeshid && Array.isArray(item.directmeshid)) {
                  item.directmeshid.forEach(meshId => {
                    meshIdMap[meshId] = idx;
                  });
                }
              });
              // 複数データに対応：配列にする
              if (!flagMap[key]) {
                flagMap[key] = [];
              }
              flagMap[key].push({
                condition: i["condition"],
                data: i["data"],
                meshIdMap: meshIdMap
              });
                    console.log(flagMap[key])
            }
          }
          // ステップ2: result.features を処理
          // 使用時：配列から全データを取得
          return result.features
            .map((e) => {;
                let key0=key;
                    
                const flagDataArray = flagMap[key0];  // 配列
              // プロパティ初期化
              origdestR=="dest"?e.properties["to"] = null:e.properties["from"] = null;
              e.properties["weekday"] = null;
              e.properties["hour"] = null;
              e.properties["direct"] = null;
              e.properties["directrideonstop"] = null;
              e.properties["directgetoffstop"] = null;
              e.properties["directridingtime"] = null;
              e.properties["directrideontime"] = null;
              e.properties["directgetofftime"] =[];
              e.properties["directexceptionserviceday"] = null;
              e.properties["directroute"] = null;
              e.properties["directagency"] = null;
              e.properties["directdimention"] = null;
              e.properties["maxstaytime"] = null;
              e.properties["minstaytime"] = null;
              if (flagDataArray) {
                // 配列の全データを検索
                for (const flagData of flagDataArray) {
                  let idx=null
                  if ("KEY_CODE" in e.properties){
                    idx= flagData.meshIdMap[e.properties["KEY_CODE"]];

                  } else {
                    idx= flagData.meshIdMap[e.properties["MESH_ID"]];

                  }
                  if (idx !== undefined) {
                  const item = flagData.data[idx];
                  if (origdestR=="dest"){
                    e.properties["to"] = flagData.condition["to"];
                  } else {
                    e.properties["from"] = flagData.condition["from"];
                  }
                  e.properties["weekday"] = flagData.condition["weekday"];
                  e.properties["hour"] = flagData.condition["hour"];
                  e.properties["direct"] = flagData.condition["direct"];
                  e.properties["dimention"] = flagData.condition["dimention"];
                  e.properties["directrideonstop"] = item.directrideonstop;
                  e.properties["directgetoffstop"] = item.directgetoffstop;
                  e.properties["directridingtime"] = item.directridingtime;
                  e.properties["directrideontime"] = item.directrideontime;
                  e.properties["directgetofftime"] = item.directgetofftime;
                  e.properties["directexceptionserviceday"] = item.directexceptionserviceday;
                  e.properties["directroute"] = item.directroute;
                  e.properties["directagency"] = item.directagency;
                  e.properties["maxstaytime"] = Math.max(...item.staytime);
                  e.properties["minstaytime"] = Math.min(...item.staytime);
                  console.log(e.properties["minstaytime"])
                    // ... その他のプロパティ
                    break;  // 最初にマッチしたら終了
                  }
                }
              }

              return e;
            })
            .filter((e) => {
              return e.properties["hour"] == parseInt(s1);
            });
          })();
          console.log(datastay);
            
                const ly=`layer-${i}`;
            //&&bounds[0] <= x1 && x2 <= bounds[2] && bounds[1] <= y1 && y2 <= bounds[3]
          const stayGeoJSON = {
            type: "FeatureCollection",
            features: datastay
          };
          i+=1
            const layer={
              id: ly,
              type: 'fill',
              sourceData: stayGeoJSON,
              paint: {
                'fill-color': [
                  'case',
                  staycheck === "stay"?['<', ['get', 'maxstaytime'], 1800]:['<', ['get', 'directridingtime'], 600],
                  'rgba(0, 0, 0, 0)',
                  staycheck === "stay"?['>=', ['get', 'maxstaytime'], 1800]:['>=', ['get', 'directridingtime'], 600],
                  [
                    'rgb',

                  staycheck === "stay"?['max', 0, ['min', 255, ['*', ['/', ['to-number', ['get', 'maxstaytime']], 43200], 255]]]:['max', 0, ['min', 255, ['*', ['/', ['to-number', ['get', 'directridingtime']], 60], 255]]],
                  0,
                  staycheck === "stay"?['max', 0, ['min', 255, ['-', 255, ['*', ['/', ['to-number', ['get', 'maxstaytime']], 43200], 255]]]]:['max', 0, ['min', 255, ['-', 255, ['*', ['/', ['to-number', ['get', 'directridingtime']], 60], 255]]]]
                  ],
                  'rgba(0, 0, 0, 0)'
                ],
                'fill-opacity': staycheck === "stay"?['case', ['<', ['get', 'maxstaytime'], 2100], 0, 1]:['case', ['<', ['get', 'directridingtime'], 600], 0, 1]
              },
              layout: {},
              visible: layercheck === "タイムスライダー"&&staycheck==="stay"?true:false,
              hoverType: "滞在時間",
            };
            layers_ridingrow.push(layer);
            if (direct==="transit"){
             
              const data1b= (() => {
              // ステップ1: flagデータをオブジェクトで事前処理
              let flagMap = {};
              let key="";
              for (const i of origdestpare[0]) {
                if (i["condition"]["weekday"][s02] === "1" && i["condition"]["hour"]==s1&&
                    i["condition"]["direct"] === "transit") {
                  
                  key = `${i["condition"]["weekday"]}_${i["condition"]["hour"]}_${i["condition"]["to"]}`;
              
                  // meshIdMap を作成
                  const meshIdMap = {};
                  i["data"].forEach((item, idx) => {
                    if (item.beforemeshid && Array.isArray(item.beforemeshid)) {
                      item.beforemeshid.forEach(meshId => {
                        meshIdMap[meshId] = idx;
                      });
                    }
                  });
                  // 複数データに対応：配列にする
                  if (!flagMap[key]) {
                    flagMap[key] = [];
                  }
                  flagMap[key].push({
                    condition: i["condition"],
                    data: i["data"],
                    meshIdMap: meshIdMap
                  });
                }
              }
              // ステップ2: result.features を処理
              // 使用時：配列から全データを取得
              return result.features
                .map((e) => {;
                  let key0=key;
                  const flagDataArray = flagMap[key0];  // 配列
                  // プロパティ初期化
                  e.properties["to"] = null;
                  e.properties["weekday"] = null;
                  e.properties["hour"] = null;
                  e.properties["beforerideonstop"] = null;
                  e.properties["beforegetoffstop"] = null;
                  e.properties["beforeridingtime"] = null;
                  e.properties["beforerideontime"] = null;
                  e.properties["beforegetofftime"] =[];
                  e.properties["beforeexceptionserviceday"] = null;
                  e.properties["beforeroute"] = null;
                  e.properties["beforeagency"] = null;
                  e.properties["beforedimention"] = null;
                  if (flagDataArray) {
                    // 配列の全データを検索
                    for (const flagData of flagDataArray) {
                      const idx = flagData.meshIdMap[e.properties["KEY_CODE"]];
                      
                      if (idx !== undefined) {
                      const item = flagData.data[idx];
                      e.properties["to"] = flagData.condition["to"];
                      e.properties["weekday"] = flagData.condition["weekday"];
                      e.properties["hour"] = flagData.condition["hour"];
                      e.properties["before"] = flagData.condition["before"];
                      e.properties["dimention"] = flagData.condition["dimention"];
                      e.properties["beforerideonstop"] = item.beforerideonstop;
                      e.properties["beforegetoffstop"] = item.beforegetoffstop;
                      e.properties["beforeridingtime"] = item.beforeridingtime;
                      e.properties["beforerideontime"] = item.beforerideontime;
                      e.properties["beforeexceptionserviceday"] = item.beforeexceptionserviceday;
                      e.properties["beforeroute"] = item.beforeroute;
                      e.properties["beforeagency"] = item.beforeagency;
                        // ... その他のプロパティ
                        break;  // 最初にマッチしたら終了
                      }
                    }
                  }

                  return e;
                })
                .filter((e) => {
                  return e.properties["hour"] == parseInt(s1) && 
                        e.properties["beforeridingtime"] >= 60;
                });
            })();
            const beforeGeoJSON = {
              type: "FeatureCollection",
              features: data1b
            };
            //setRidingtime(directGeoJSON);
              const bisv=d1.hasOwnProperty(d)?d1[d]["checked"]:d1["checked"];
              const bisLayer = layercheck === "複数レイヤー表示"?true:false;
              const bisActive = kind === "所要時間"?true:false;
              
              let bratiolist=[];
              let bvaluelist=[];
              const blayer={
                id: lyb,
                type: 'fill',
                sourceData: beforeGeoJSON,
                paint: {
                  'fill-color':origdest==="dest"? [
                    'case',
                    ['>=', ['get', 'beforeridingtime'], 60],
                    [
                      'rgb',
                      ['max', 0, ['min', 255, ['-', 255, ['/', ['to-number', ['get', 'beforeridingtime']], 10]]]],
                      255,
                      ['max', 0, ['min', 255, ['/', ['to-number', ['get', 'beforeridingtime']], 10]]]
                    ],
                    'rgba(0, 0, 0, 0)'
                  ]:[
                    'case',
                    ['>=', ['get', 'afterridingtime'], 60],
                    [
                      'rgb',
                      ['max', 0, ['min', 255, ['-', 255, ['/', ['to-number', ['get', 'afterridingtime']], 10]]]],
                      255,
                      ['max', 0, ['min', 255, ['/', ['to-number', ['get', 'afterridingtime']], 10]]]
                    ],
                    'rgba(0, 0, 0, 0)'
                  ],
                  'fill-opacity': 1,
                  'fill-outline-color': '#170d0d'  // 白い枠線
                },
                layout: {},
                visible: layercheck === "複数レイヤー表示"?bisv:false,
                hoverType: "所要時間"
              };
            layers_ridingrow.push(blayer);
            const data1a= (() => {
            for (const i of origdestpare[0]) {
                if (i["condition"]["weekday"][s02] === "1" && i["condition"]["hour"]==s1&&
                    i["condition"]["direct"] === "transit") {
                  
                  key = `${i["condition"]["weekday"]}_${i["condition"]["hour"]}_${i["condition"]["from"]}`;
              
                  // meshIdMap を作成
                  const meshIdMap = {};
                  i["data"].forEach((item, idx) => {
                    if (item.aftermeshid && Array.isArray(item.aftermeshid)) {
                      item.aftermeshid.forEach(meshId => {
                        meshIdMap[meshId] = idx;
                      });
                    }
                  });
                  // 複数データに対応：配列にする
                  if (!flagMap[key]) {
                    flagMap[key] = [];
                  }
                  flagMap[key].push({
                    condition: i["condition"],
                    data: i["data"],
                    meshIdMap: meshIdMap
                  });
                }
              }
              // ステップ2: result.features を処理
              // 使用時：配列から全データを取得
              return result.features
                .map((e) => {;
                  let key0=key;
                  const flagDataArray = flagMap[key0];  // 配列
                  // プロパティ初期化
                  e.properties["to"] = null;
                  e.properties["weekday"] = null;
                  e.properties["hour"] = null;
                  e.properties["afterrideonstop"] = null;
                  e.properties["aftergetoffstop"] = null;
                  e.properties["afterridingtime"] = null;
                  e.properties["afterrideontime"] = null;
                  e.properties["aftergetofftime"] =[];
                  e.properties["afterexceptionserviceday"] = null;
                  e.properties["afterroute"] = null;
                  e.properties["afteragency"] = null;
                  e.properties["afterdimention"] = null;
                  if (flagDataArray) {
                    // 配列の全データを検索
                    for (const flagData of flagDataArray) {
                      const idx = flagData.meshIdMap[e.properties["KEY_CODE"]];
                      
                      if (idx !== undefined) {
                      const item = flagData.data[idx];
                      e.properties["to"] = flagData.condition["to"];
                      e.properties["weekday"] = flagData.condition["weekday"];
                      e.properties["hour"] = flagData.condition["hour"];
                      e.properties["dimention"] = flagData.condition["dimention"];
                      e.properties["afterrideonstop"] = item.afterrideonstop;
                      e.properties["aftergetoffstop"] = item.aftergetoffstop;
                      e.properties["afterridingtime"] = item.afterridingtime;
                      e.properties["afterrideontime"] = item.afterrideontime;
                      e.properties["afterexceptionserviceday"] = item.afterexceptionserviceday;
                      e.properties["afterroute"] = item.afterroute;
                      e.properties["afteragency"] = item.afteragency;
                        // ... その他のプロパティ
                        break;  // 最初にマッチしたら終了
                      }
                    }
                  }

                  return e;
                })
                .filter((e) => {
                  return e.properties["hour"] == parseInt(s1) && 
                        e.properties["afterridingtime"] >= 60;
                });
            })();
            const afterGeoJSON = {
              type: "FeatureCollection",
              features: data1a
            };
            //setRidingtime(directGeoJSON);
              const aisv=d1.hasOwnProperty(d)?d1[d]["checked"]:d1["checked"];
              const aisLayer = layercheck === "複数レイヤー表示"?true:false;
              const aisActive = kind === "所要時間"?true:false;
              
              let aratiolist=[];
              let avaluelist=[];
              const alayer={
                id: lyb,
                type: 'fill',
                sourceData: afterGeoJSON,
                paint: {
                  'fill-color':[
                    'case',
                    ['>=', ['get', 'afterridingtime'], 60],
                    [
                      'rgb',
                      ['max', 0, ['min', 255, ['-', 255, ['/', ['to-number', ['get', 'afterridingtime']], 10]]]],
                      255,
                      ['max', 0, ['min', 255, ['/', ['to-number', ['get', 'afterridingtime']], 10]]]
                    ],
                    'rgba(0, 0, 0, 0)'
                  ],
                  'fill-opacity': 1,
                  'fill-outline-color': '#170d0d'  // 白い枠線
                },
                layout: {},
                visible: layercheck === "複数レイヤー表示"?aisv:false,
                hoverType: "所要時間"
              };
            layers_ridingrow.push(alayer);
            } 
            }
          }
      }
    }
    
    
    return layers_ridingrow},[layercheck,time,dest,weekday,direct,weekdayflag,staycheck])
  
  const getMinMax = (values) => {
    if (values.length === 0) return { max: null, min: null };

    // 数値のみにフィルタ
    const ebers = values.filter(v => typeof v === "number" || !isNaN(parseFloat(v)))
                          .map(v => parseFloat(v));

    if (ebers.length === 0) return { max: null, min: null };

    return {
      max: Math.max(...ebers),
      min: Math.min(...ebers)
    };
  };
  
  let popmeshkey=[];
  const layers = useMemo(() => {
      if (!data) return [];
      const layers_row = [];
      console.log("🔄 useMemo re-running, data updated:", data);
      // Note: Mapbox background layer is handled by mapStyle, no need for TileLayer
      let i=0;
    //console.log(data);
    for (let d in data){
      // 例: check配列の中にこのレイヤー名が含まれているか確認
      // 都市計画では「表示/非表示」の切り替えが頻繁なのでここで制御
      //const isVisible = check.includes(d.property.name); 
      if (Object.entries(data[d]).length>0){
          console.log(d)
        
          //console.log(data[d]);
          for (const [key, d1] of Object.entries(data[d])){
            i+=1;

            if (pointkind.includes(d)){
                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}`:`layer-${d}-${d1["detail"]}-${i}`;
                const d02=d1.hasOwnProperty(d)?d1[d]["data"]:d1["data"];
                const d01=d1["checked"];
                const layer={
                  id: ly,
                  type: 'circle',
                  sourceData: d02,
                  paint: {
                    'circle-radius': 2,
                    'circle-color': '#ff0000',
                    'circle-opacity': 1.0,
                    'circle-stroke-width': 0,
                    'circle-blur': 0
                  },
                  layout: {},
                  visible: d01,
                  hoverType: "施設",
                  clickHandler: (feature) => {
                    try{
                      setClickstop(feature.properties.name);
                    } catch(e){}
                  }
                };
                layers_row.push(layer);
              
            } else if (linekind.includes(d)) {
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}`:`layer-${d}-${d1["detail"]}-${i}`;
              console.log(d1["detail"],d1["checked"])
              const layer={
                id: ly,
                type: 'line',
                sourceData: d1.hasOwnProperty(d)?d1[d]["data"]:d1["data"],
                paint: {
                  'line-color': d==="area"?'#090808':'#ff0000',
                  'line-width':d==="area"?1: 3
                },
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                visible: d1["checked"],
                hoverType: "道路",
                clickHandler: (feature) => {
                  try{
                    setClicknearestbusline(feature.properties.name.replace(/[^0-9]/g, ''));
                  } catch(e){}
                }
              };
              layers_row.push(layer);
            } else if (meshkind.includes(d)) {
              console.log(d)
              const data1=d1.hasOwnProperty(d)?d1[d]["data"]:d1["data"];
              const data1r=pop!=""&&d==="popmesh"?data1.features.filter((e)=>{return e.properties[pop]>0}):data1;

              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}`:`layer-${d}-${d1["detail"]}-${i}`;
              const isv=d1.hasOwnProperty(d)?d1[d]["checked"]:d1["checked"];
              console.log(isv)
              const Area =area;
              const layer={
                id: ly,
                type: 'fill',
                sourceData: data1r,
                paint: {
                  'fill-color': [
                    'case',
                    ['!=', ['get', pop], null],
                    ['rgb', 255, ['*', 255, ['-', 1, ['/', ['to-number', ['get', pop]], 100]]], 0],
                    '#ffffff'
                  ],
                  'fill-opacity': 0.6
                },
                layout: {},
                visible: layercheck==="複数レイヤー表示"?isv:true,
                hoverType: "居住地",
                clickHandler: (feature) => {
                  try{
                    setClickpopmesh(parseInt(feature.properties.PT00_2025));
                    setClickpopmeshaddress(feature.properties[Area]);
                  } catch(e){
                    console.log(e.message);
                  }
                }
              };
              layers_row.push(layer);
  
            
            } else if (d === "ridingtime_direct"|| d==="fare") {
              
          const Area =area;
          let s = dest;
          let s0 = weekday;
          let s1 = parseInt(Math.round(time*100000000)+10);
          let s2="direct";
          let s02=parseInt(weekdayflag)-1;
          const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}`:`layer-${d}-${d1["detail"]}-${i}`;
          let flag=[];
            if(layercheck!="複数レイヤー表示"){
              d1.hasOwnProperty(d)?flagall.push(d1[d]["data"]):flagall.push(d1["data"]);

            
              for (const k of flagall){
                console.log(dest)
                if (k.length>=1)
                {
                  if (origdestR=="dest"&&k[0]["condition"].hasOwnProperty("to")&&k[0]["condition"]["to"]==dest){
                    flag=k;
                  } else if (origdestR=="orig"&&k[0]["condition"].hasOwnProperty("from")&&k[0]["condition"]["from"]==dest){
                    flag=k;
                  }

                } else{
                    
                  if (origdestR=="dest"&&k["condition"].hasOwnProperty("to")&&k["condition"]["to"]==dest){
                    flag=k;
                  } else if (origdestR=="orig"&&k["condition"].hasOwnProperty("from")&&k["condition"]["from"]==dest){
                    flag=k;
                  }
                }
              }
            } else{
              d1.hasOwnProperty(d)?flag=d1[d]["data"]:flag=d1["data"];
            }
            const data1r = (() => {
            // ステップ1: flagデータをオブジェクトで事前処理
            let flagMap = {};
            let key="";
            for (const i of flag) {
              if (i["condition"]["weekday"][s02] === "1" && i["condition"]["hour"]==s1&&
                  i["condition"]["direct"] === "direct") {
                
                key = origdestR=="dest"?`${i["condition"]["weekday"]}_${i["condition"]["hour"]}_${i["condition"]["to"]}`:`${i["condition"]["weekday"]}_${i["condition"]["hour"]}_${i["condition"]["from"]}`;
                console.log(key)
                // meshIdMap を作成
                const meshIdMap = {};
                i["data"].forEach((item, idx) => {
                  if (item.directmeshid && Array.isArray(item.directmeshid)) {
                    item.directmeshid.forEach(meshId => {
                      meshIdMap[meshId] = idx;
                    });
                  }
                });
                // 複数データに対応：配列にする
                if (!flagMap[key]) {
                  flagMap[key] = [];
                }
                flagMap[key].push({
                  condition: i["condition"],
                  data: i["data"],
                  meshIdMap: meshIdMap
                });
              }
            }
            // ステップ2: result.features を処理
            // 使用時：配列から全データを取得
            return result.features
              .map((e) => {;
                  let key0=key;
                  const flagDataArray = flagMap[key0];  // 配列
                // プロパティ初期化
                origdestR=="dest"?e.properties["to"] = null:e.properties["from"] = null;
                e.properties["weekday"] = null;
                e.properties["hour"] = null;
                e.properties["direct"] = null;
                e.properties["directrideonstop"] = null;
                e.properties["directgetoffstop"] = null;
                e.properties["directridingtime"] = null;
                e.properties["directrideontime"] = null;
                e.properties["directgetofftime"] =[];
                e.properties["directexceptionserviceday"] = null;
                e.properties["directroute"] = null;
                e.properties["directagency"] = null;
                e.properties["directdimention"] = null;
                e.properties["directgetofffare"] = null;
                if (flagDataArray) {
                  // 配列の全データを検索
                  for (const flagData of flagDataArray) {
                    let idx=null
                    if ("KEY_CODE" in e.properties){
                      idx= flagData.meshIdMap[e.properties["KEY_CODE"]];

                    } else {
                      idx= flagData.meshIdMap[e.properties["MESH_ID"]];

                    }
                    if (idx !== undefined) {
                    const item = flagData.data[idx];
                    if (origdestR=="dest"){
                      e.properties["to"] = flagData.condition["to"];
                    } else {
                      e.properties["from"] = flagData.condition["from"];
                    }
                    e.properties["weekday"] = flagData.condition["weekday"];
                    e.properties["hour"] = flagData.condition["hour"];
                    e.properties["direct"] = flagData.condition["direct"];
                    e.properties["dimention"] = flagData.condition["dimention"];
                    e.properties["directrideonstop"] = item.directrideonstop;
                    e.properties["directgetoffstop"] = item.directgetoffstop;
                    e.properties["directridingtime"] = item.directridingtime;
                    e.properties["directrideontime"] = item.directrideontime;
                    e.properties["directgetofftime"] = item.directgetofftime;
                    e.properties["directexceptionserviceday"] = item.directexceptionserviceday;
                    e.properties["directroute"] = item.directroute;
                    e.properties["directagency"] = item.directagency;
                    e.properties["directgetofffare"] = item.getofffare;
                      // ... その他のプロパティ
                      break;  // 最初にマッチしたら終了
                    }
                  }
                }

                return e;
              });
            })();
          //&&bounds[0] <= x1 && x2 <= bounds[2] && bounds[1] <= y1 && y2 <= bounds[3]
        const filteredGeoJSON = {
          type: "FeatureCollection",
          features: data1r
        };
        setRidingtime(filteredGeoJSON);
          const isv=d1.hasOwnProperty(d)?d1[d]["checked"]:d1["checked"];
          const isLayer = layercheck === "複数レイヤー表示"?true:false;
          const isActive = kind === "所要時間"?true:false;
          
          let ratiolist=[];
          let valuelist=[];
          const layer={
            id: ly,
            type: 'fill',
            sourceData: filteredGeoJSON,
            paint: {
              'fill-color': [
                'case',
                d==="fare"?['<', ['get', 'directgetofffare'], 60]:['<', ['get', 'directridingtime'], 60],
                'rgba(0, 0, 0, 0)',
                ['>=', ['get', 'directridingtime'], 60],
                [
                  'rgb',
                  d==="fare"?['max', 0, ['min', 255, ['-', 255, ['/', ['to-number', ['get', 'directgetofffare']], 10]]]]:['max', 0, ['min', 255, ['-', 255, ['/', ['to-number', ['get', 'directridingtime']], 10]]]],
                  255,
                  d==="fare"?['max', 0, ['min', 255, ['/', ['to-number', ['get', 'directgetofffare']], 10]]]:['max', 0, ['min', 255, ['/', ['to-number', ['get', 'directridingtime']], 10]]]
                ],
                'rgba(0, 0, 0, 0)'
              ],
              'fill-opacity': ['case', d==="fare"?['<', ['get', 'directgetofffare'], 100]:['<', ['get', 'directridingtime'], 60], 0, 1]
            },
            layout: {},
            visible: layercheck === "複数レイヤー表示"?isv:false,
            hoverType: d==="fare"?"運賃":"所要時間",
            clickHandler: (feature) => {
              try{
                console.log('Clicked:', feature.properties[s0]);
                setClicknearestridetime(feature.properties[s0]);
                setClicknearestgetofftime(feature.properties[s1]);
                setClickneareststop(feature.properties[stop]);
                setClicknearestbusline(feature.properties["route"]);
                console.log('Clicked:', feature.properties[Area]);
                setClickpopmeshaddress(feature.properties[Area]);
              } catch(e){
                console.log(e.message);
              }
            }
          };
          layers_row.push(layer);
          const point=d1.hasOwnProperty(d)?d1[d]["point"]:d1["point"];
          let data1p=[];
          for (let k in point){
            data1p.push({"name":point[k]["stopname"],"coordinates":[point[k]["stoplon"],point[k]["stoplat"]]})
          }
          const isv0=d1.hasOwnProperty(d)?d1[d]["checked"]:d1["checked"];
          const ly1=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}`:`layer-${d}-${d1["detail"]}-${i+5}`;
          const layerpoint={
            id: ly1,
            type: 'symbol',
            sourceData: {
              type: 'FeatureCollection',
              features: data1p.map((d, idx) => ({
                type: 'Feature',
                properties: { name: d.name },
                geometry: { type: 'Point', coordinates: d.coordinates }
              }))
            },
            layout: {
              'icon-image': 'marker',
              'icon-size': ['interpolate', ['linear'], ['zoom'], 0, 0.1, 24, 0.1]
            },
            paint: {},
            visible: layercheck === "複数レイヤー表示"?isv0:false,
            hoverType: "所要時間",
            clickHandler: (feature) => {}
          };
          console.log(layerpoint);
          layers_row.push(layerpoint);
          const ly2=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}`:`layer-${d}-${d1["detail"]}-${i*5+100}`;
          const isv1=d1.hasOwnProperty(d)?d1[d]["checked"]:d1["checked"];
          const layertextpoint={
            id: ly2,
            type: 'symbol',
            sourceData: {
              type: 'FeatureCollection',
              features: data1p.map((d, idx) => ({
                type: 'Feature',
                properties: { name: d.name },
                geometry: { type: 'Point', coordinates: d.coordinates }
              }))
            },
            layout: {
              'text-field': ['get', 'name'],
              'text-size': 25,
              'text-anchor': 'center',
              'text-offset': [0, -2.2]
            },
            paint: {
              'text-color': '#010166'
            },
            visible: layercheck === "複数レイヤー表示"?isv1:false,
            hoverType: "所要時間",
            clickHandler: (feature) => {}
          };
          console.log(layertextpoint);
          layers_row.push(layertextpoint);

        }  else if (d === "frequency_on_routes") {
              const Area =area;
              //console.log(d1["data"]);
              let s = `JR西条駅_${weekday}_${Math.round(time*100000000)+5}_frequency_direct`;
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              const data1=d1.hasOwnProperty(d)?d1[d]["data"]:d1["data"];
              //const data1r=data1.features.filter((e)=>{return bounds[0]<=e.geometry.coordinates[0][0][0]||e.geometry.coordinates[0][2][0]<=bounds[2]||bounds[1]<=e.geometry.coordinates[0][0][1]||e.geometry.coordinates[0][2][1]<=bounds[3]});
              const data1r=data1;
              console.log(data1r.length);
              const layer={
                id: ly,
                type: 'fill',
                sourceData: data1r,
                paint: {
                  'fill-color': [
                    'case',
                    ['all',
                      ['==', kind, '運行本数'],
                      ['==', layercheck, 'タイムスライダー'],
                      ['!=', ['get', s], null]
                    ],
                    [
                      'rgb',
                      0,
                      ['max', 0, ['min', 153, ['-', 153, ['floor', ['/', ['*', ['to-number', ['get', s]], 153], 5]]]]],
                      ['max', 0, ['min', 204, ['-', 204, ['floor', ['/', ['*', ['to-number', ['get', s]], 204], 5]]]]]
                    ],
                    [
                      'rgb',
                      0,
                      0,
                      0
                    ]
                  ],
                  'fill-opacity': 1
                },
                layout: {},
                visible: kind=="運行本数"&&layercheck=="タイムスライダー"?true:d1["checked"],
                hoverType: "運行本数",
                clickHandler: (feature) => {
                  try{
                    console.log(feature.properties.stop_name);
                    setClickneareststop(feature.properties.stop_name);
                    setClickpopmeshaddress(feature.properties[Area]);
                  } catch(e){
                    //console.log(e.message);
                  }
                }
              };
              layers_row.push(layer);
              console.log(layer.props,pickable);
            } else if (d === "ridingtime_transit") {
              const Area =area;
              let s = dest;
              let s0 = weekday;
              let s1 = parseInt(Math.round(time*100000000)+10);
              let s2="direct";
              let s02=parseInt(weekdayflag)-1;
              const lyd=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}1`:`layer-${d}-${d1["detail"]}-${i}1`;
              const lyb=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}b`:`layer-${d}-${d1["detail"]}-${i}b`;
              let flag=[];
              if(layercheck!="複数レイヤー表示"){
              d1.hasOwnProperty(d)?flagall.push(d1[d]["data"]):flagall.push(d1["data"]);

              
              for (const k of flagall){
                if (k.length>=1)
                {
                  if (k[0]["condition"]["to"]==dest){
                    flag=k;
                  }

                } else{
                    if (k["condition"]["to"]==dest){
                    flag=k;
                  }
                }
              }
            } else{
              flag=d1.hasOwnProperty(d)?d1[d]["data"]:d1["data"];
            }
            console.log(flag);
             const data1b = result.features
            .map((e) => {
              // プロパティ初期化
              e.properties["to"] = null;
              e.properties["weekday"] = null;
              e.properties["hour"] = null;
              e.properties["direct"] = null;
              e.properties["rideonstop"] = [];
              e.properties["getoffstop"] = [];
              e.properties["ridingtime"] = [];
              e.properties["rideontime"] = [];
              e.properties["getofftime"] =[];
              e.properties["exceptionserviceday"] = [];
              e.properties["route"] = [];
              e.properties["agency"] = [];
              e.properties["dimention"] = [];
              for (const i1 of flag) {
                
                for(let l in Object.values(obj)){
                  let flagb=[];
                  for (let l1 in Object.values(obj)[l]){
                    for (let k in Object.values(obj)[l][l1].beforemeshid){
                      flagb.push(Object.values(obj)[l][l1].beforemeshid[k])
                      }
                  } 
                  let flag0b=new Set(flagb)  
                  if(layercheck==="複数レイヤー表示"){
                    if (flag0b.has(e.properties["MESH_ID"])) {
                      e.properties["to"] = i1["condition"]["to"];
                      e.properties["weekday"] = i1["condition"]["weekday"];
                      e.properties["hour"] = i1["condition"]["hour"];
                      e.properties["direct"] = i1["condition"]["direct"];
                    }
                  }    
                  }
                }    
                

           
              return e;
            }).filter((e)=>{return e.properties["to"]!=null})
            //&&bounds[0] <= x1 && x2 <= bounds[2] && bounds[1] <= y1 && y2 <= bounds[3]
            const beforeGeoJSON = {
              type: "FeatureCollection",
              features: data1b
            };
            console.log(beforeGeoJSON);
            //setRidingtime(directGeoJSON);
              const bisv=d1.hasOwnProperty(d)?d1[d]["checked"]:d1["checked"];
              const bisLayer = layercheck === "複数レイヤー表示"?true:false;
              const bisActive = kind === "所要時間"?true:false;
              
              let bratiolist=[];
              let bvaluelist=[];
              const blayer={
                id: lyb,
                type: 'fill',
                sourceData: beforeGeoJSON,
                paint: {
                  'fill-color': '#ff0000',
                  'fill-opacity': 1
                },
                layout: {},
                visible: layercheck === "複数レイヤー表示"?bisv:false,
                hoverType: "所要時間",
                clickHandler: (feature) => {
                  try{
                    console.log('Clicked:', feature.properties[s0]);
                    setClicknearestridetime(feature.properties[s0]);
                    setClicknearestgetofftime(feature.properties[s1]);
                    setClickneareststop(feature.properties[stop]);
                    setClicknearestbusline(feature.properties["route"]);
                    console.log('Clicked:', feature.properties[Area]);
                    setClickpopmeshaddress(feature.properties[Area]);
                  } catch(e){
                    console.log(e.message);
                  }
                }
              };
              layers_row.push(blayer);
            const data1d = result.features
            .map((e) => {
              // プロパティ初期化
              e.properties["to"] = null;
              e.properties["weekday"] = null;
              e.properties["hour"] = null;
              e.properties["direct"] = null;
              e.properties["rideonstop"] = [];
              e.properties["getoffstop"] = [];
              e.properties["ridingtime"] = [];
              e.properties["rideontime"] = [];
              e.properties["getofftime"] =[];
              e.properties["exceptionserviceday"] = [];
              e.properties["route"] = [];
              e.properties["agency"] = [];
              e.properties["dimention"] = [];
              for (const i1 of flag) {
                
                for(let l in Object.values(obj)){
                  let flagb=[];
                  for (let l1 in Object.values(obj)[l]){
                    for (let k in Object.values(obj)[l][l1].directmeshid){
                      flagb.push(Object.values(obj)[l][l1].directmeshid[k])
                      }
                  } 
                  let flag0b=new Set(flagb)  
                  if(layercheck==="複数レイヤー表示"){
                    if (flag0b.has(e.properties["MESH_ID"])) {
                      e.properties["to"] = i1["condition"]["to"];
                      e.properties["weekday"] = i1["condition"]["weekday"];
                      e.properties["hour"] = i1["condition"]["hour"];
                      e.properties["direct"] = i1["condition"]["direct"];
                    }
                  }    
                  }
                }    
                

           
              return e;
            }).filter((e)=>{return e.properties["to"]!=null})
            //&&bounds[0] <= x1 && x2 <= bounds[2] && bounds[1] <= y1 && y2 <= bounds[3]
            const directGeoJSON = {
              type: "FeatureCollection",
              features: data1d
            };
            setRidingtime(directGeoJSON);
              const isv=d1.hasOwnProperty(d)?d1[d]["checked"]:d1["checked"];
              const isLayer = layercheck === "複数レイヤー表示"?true:false;
              const isActive = kind === "所要時間"?true:false;
              
              let ratiolist=[];
              let valuelist=[];
              const layer={
                id: lyd,
                type: 'fill',
                sourceData: directGeoJSON,
                paint: {
                  'fill-color': [
                    'case',
                    ['==', layercheck, '複数レイヤー表示'],
                    '#008080',
                    '#00ff00'
                  ],
                  'fill-opacity': 1
                },
                layout: {},
                visible: layercheck === "複数レイヤー表示"?isv:false,
                hoverType: "所要時間",
                clickHandler: (feature) => {
                  try{
                    console.log('Clicked:', feature.properties[s0]);
                    setClicknearestridetime(feature.properties[s0]);
                    setClicknearestgetofftime(feature.properties[s1]);
                    setClickneareststop(feature.properties[stop]);
                    setClicknearestbusline(feature.properties["route"]);
                    console.log('Clicked:', feature.properties[Area]);
                    setClickpopmeshaddress(feature.properties[Area]);
                  } catch(e){
                    console.log(e.message);
                  }
                }
              };
              layers_row.push(layer);


              const point=d1.hasOwnProperty(d)?d1[d]["point"]:d1["point"];
              let data1p=[];
              for (let k in point){
                data1p.push({"name":point[k]["stopname"],"coordinates":[point[k]["stoplon"],point[k]["stoplat"]]})
              }
              const isv0=d1.hasOwnProperty(d)?d1[d]["checked"]:d1["checked"];
              const ly1=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}`:`layer-${d}-${d1["detail"]}-${i+5}`;
              const layerpoint={
                id: ly1,
                type: 'symbol',
                sourceData: {
                  type: 'FeatureCollection',
                  features: data1p.map((d, idx) => ({
                    type: 'Feature',
                    properties: { name: d.name },
                    geometry: { type: 'Point', coordinates: d.coordinates }
                  }))
                },
                layout: {
                  'icon-image': 'marker',
                  'icon-size': ['interpolate', ['linear'], ['zoom'], 0, 0.1, 24, 0.1]
                },
                paint: {},
                visible: layercheck === "複数レイヤー表示"?isv0:false,
                hoverType: "所要時間",
                clickHandler: (feature) => {}
              };
              console.log(layerpoint);
              layers_row.push(layerpoint);
              const ly2=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]["detail"]}-${i}`:`layer-${d}-${d1["detail"]}-${i*5+100}`;
              const isv1=d1.hasOwnProperty(d)?d1[d]["checked"]:d1["checked"];
              const layertextpoint={
                id: ly2,
                type: 'symbol',
                sourceData: {
                  type: 'FeatureCollection',
                  features: data1p.map((d, idx) => ({
                    type: 'Feature',
                    properties: { name: d.name },
                    geometry: { type: 'Point', coordinates: d.coordinates }
                  }))
                },
                layout: {
                  'text-field': ['get', 'name'],
                  'text-size': 25,
                  'text-anchor': 'center',
                  'text-offset': [0, -2.2]
                },
                paint: {
                  'text-color': '#010166'
                },
                visible: layercheck === "複数レイヤー表示"?isv1:false,
                hoverType: "所要時間",
                clickHandler: (feature) => {}
              };
              console.log(layertextpoint);
              layers_row.push(layertextpoint);

            }
          }
        i+=1;
      }
    }
    console.log("🎬 layers_row count:", layers_row.length, "railline layers:", layers_row.filter(l => l.id && l.id.includes('railline')).length);
    return layers_row;
  }, [data,kind,hover,address,area,layercheck,pop,dimention,flagcheck]);
  // 追加：layers_row が更新されたことを確認
  useEffect(() => {
    console.log("🎬 layers_row count: ? railline layers: ?");
  }, [data,layers,flagcheck]);
  // Map reference for Mapbox GL JS
  const mapRef = useRef(null);
  const loadedSourcesRef = useRef(new Set());
  const clickHandlersRef = useRef({});

  // Setup layers in Mapbox GL JS
  useEffect(() => {
    const map = mapRef.current?.getMap?.();
    if (!map || !map.isStyleLoaded()) return;

    // Separate layers: mesh first, then points on top
    const meshLayers = layers.filter(l => l.type === 'fill' || l.type === 'line');
    const pointLayers = layers.filter(l => l.type === 'symbol' || l.type === 'circle');
    const allLayers = [...meshLayers, ...ridingtimerow, ...pointLayers];

    allLayers.forEach((layerConfig, index) => {
      if (!layerConfig || !layerConfig.id || !layerConfig.sourceData) return;
      
      const sourceId = layerConfig.source || layerConfig.id;

      // Add/update source
      if (!loadedSourcesRef.current.has(sourceId)) {
        try {
          map.addSource(sourceId, {
            type: 'geojson',
            data: layerConfig.sourceData
          });
          loadedSourcesRef.current.add(sourceId);
        } catch (e) {
          // Source already exists, update instead
          const source = map.getSource(sourceId);
          if (source && source.setData) {
            source.setData(layerConfig.sourceData);
          }
        }
      } else {
        const source = map.getSource(sourceId);
        if (source && source.setData) {
          source.setData(layerConfig.sourceData);
        }
      }

      // Add layer if not exists
      if (!map.getLayer(layerConfig.id)) {
        // Point layers (symbol) should be on top
        const beforeId = (layerConfig.type === 'symbol' || layerConfig.type === 'circle')
          ? undefined
          : null;
        map.addLayer({
          id: layerConfig.id,
          type: layerConfig.type,
          source: sourceId,
          glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",  // ← これ追加
          paint: layerConfig.paint,
          layout: layerConfig.layout
        }, beforeId);
      } else if (layerConfig.type === 'symbol' || layerConfig.type === 'circle') {
        // Move symbol/circle layers to top
        try {
          map.moveLayer(layerConfig.id);
        } catch (e) {
          // ignore if layer doesn't exist
        }
      }

      // Update visibility
      map.setLayoutProperty(layerConfig.id, 'visibility', layerConfig.visible ? 'visible' : 'none');

      // Register click handler (safely)
      if (layerConfig.clickHandler && hover === layerConfig.hoverType) {
        try {
          if (clickHandlersRef.current[layerConfig.id]) {
            map.off('click', layerConfig.id, clickHandlersRef.current[layerConfig.id]);
          }
          const handler = (e) => {
            if (e.features && e.features.length > 0) {
              layerConfig.clickHandler(e.features[0]);
            }
          };
          // Only register if layer exists
          if (map.getLayer(layerConfig.id)) {
            map.on('click', layerConfig.id, handler);
            clickHandlersRef.current[layerConfig.id] = handler;
          }
        } catch (err) {
          console.warn(`Failed to register click handler for layer ${layerConfig.id}:`, err);
        }
      }
    });
  }, [layers, ridingtimerow, hover, data, pop, flag]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
        <p>{address}</p>
      </div>
      <Map
        ref={mapRef}
        initialViewState={viewAccessibility}
        mapboxAccessToken={mapboxAccessToken}
        mapStyle={mapstyle}
        onMove={({ viewState }) => setviewAccessibility(viewState)}
      />
    </div>
  );
};
export default UpdateLayers;