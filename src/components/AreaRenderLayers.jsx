import { useContext, useMemo,useState,useRef,useEffect,ClickareaCount,useCallback} from 'react';
import { DeckGL } from '@deck.gl/react';
import { GeoJsonLayer,TextLayer, ScatterplotLayer,IconLayer } from '@deck.gl/layers';
import Map from 'react-map-gl/mapbox';
import React from 'react';
import {PathStyleExtension} from '@deck.gl/extensions';
import {MVTLayer} from '@deck.gl/geo-layers';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import { WebMercatorViewport } from '@deck.gl/core'
import EditLine from './EditLine';
import { mapboxAccessToken, mapstyle,initialCheck,vividColors } from "./Globalvariable";
import {useHoverStore,useLegendStore,useDirectStore,useLayerflagStore,usePopStore,usePopmeshStore,useEditStore,useAreaStore,useViewAccesibilityStore,useLayercheckStore,useClickmeshStore,useDestStore,useWeekdayStore,useKindStore,useFareStore,useClickareaStore,useTimesliderStore,useGetboundaryStore,useClicklanduseStore,useClickplanningareaStore,useDataStore,useColorareaStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestraillineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore} from "./useStore";
const AreaLayers = (props) => {
  const setLegends = useLegendStore((state) => state.setLegends);
  const origdest=useDirectStore((state)=> state.sorig)
  const [selected, setSelected] = useState(false)
  const color_l=[];
  const {layerflag,setlayerflag}=useLayerflagStore.getState()
  const popmesh = usePopmeshStore.getState().popmesh;
  const setArea_list = useColorareaStore((state) => state.setColorarea);
  const viewAccessibility=useViewAccesibilityStore((state) => state.select);
  const setviewAccessibility=useViewAccesibilityStore((state) => state.selectView);
  const viewport = new WebMercatorViewport(viewAccessibility)
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
  const data = useDataStore.getState().data;
  const flag = useDataStore((state) => state.flag);

  let nw=[132.590317,34.618206];
  let ne=[132.94325324146035,34.61707537902578];
  let sw=[132.56834478273046,34.27392753449381];
  let se=[132.90480109184705,34.292082779796985];
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
  const { edit, setEdit } = useEditStore.getState();
  let flagall=[]
  const mergeGeoJSON = (geoJsonArray) => ({
    type: "FeatureCollection",
    features: geoJsonArray.flatMap(gj => gj.features)
  });
  let allFeatures =[];
  for (let j in popmesh){
    if (popmesh[j][4]===dimention){
    allFeatures.push(popmesh[j][2])

    }
  }
  const result = mergeGeoJSON(allFeatures);
  const ridingtimerow = useMemo(()=>{
    console.log(time,dest,weekday);
    let layers_ridingrow=[]
  let i=0
  let s = dest;
  let s0 = weekday;
  let s1 = parseInt(Math.round(time*100000000)+10);
  let s2="direct";
  let s02=parseInt(weekdayflag)-1;
  let directtransit=["direct","transit"];
  let origdest0=["orig","dest"];
  for (let d in data){
    // 例: check配列の中にこのレイヤー名が含まれているか確認
    // 都市計画では「表示/非表示」の切り替えが頻繁なのでここで制御
    //const isVisible = check.includes(d.property.name); 
    if (Object.entries(data[d]).length>0&&time!=""&&dest!=""&&weekday!=""){
        
      //console.log(data[d]);
      for (const [key, d1] of Object.entries(data[d])){
        for (const d2 of directtransit){
          for(const d3 of origdest0){
                if (d === `ridingtime_${d2}_${d3}`) {
                  i+=1
              const Area =area;
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
              let flag=[];
              if(layercheck!="複数レイヤー表示"){
              d1.hasOwnProperty(d)?flagall.push(d1[d][2]):flagall.push(d1[2]);

              
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
              d1.hasOwnProperty(d)?flag=d1[d][2]:flag=d1[2];
            }
              const data1r = result.features
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
                // データをマッチさせて更新
                
                for (const i of flag) {
                    
                  if (i["condition"]["weekday"][s02]==="1"&&i["condition"]["hour"]===parseInt(s1)&&i["condition"]["direct"]==="direct"){
                    const flagr0 = i["data"].map(item => item.meshid);
                    e.properties["dimention"] = i["condition"]["dimention"];
                    e.properties["to"] = i["condition"]["to"];
                    e.properties["weekday"] = i["condition"]["weekday"];
                    e.properties["hour"] = i["condition"]["hour"];
                    e.properties["direct"] = i["condition"]["direct"];
                    let rideonstop=i["data"].map(u=>u.rideonstop);
                    let getoffstop=i["data"].map(u=>u.getoffstop);
                    let ridingtime=i["data"].map(u=>u.ridingtime);
                    let rideontime=i["data"].map(u=>u.rideontime);
                    let getofftime=i["data"].map(u=>u.getofftime);
                    let exceptionserviceday=i["data"].map(u=>u.exceptionserviceday);
                    let route=i["data"].map(u=>u.route);
                    let agency=i["data"].map(u=>u.agency);
                    let index=flagr0.findIndex(row => row.includes(e.properties["MESH_ID"]));
                    if (index!=-1){
                      e.properties["rideonstop"]=rideonstop[index];
                      e.properties["getoffstop"]=getoffstop[index];
                      e.properties["ridingtime"]=ridingtime[index];
                      e.properties["rideontime"]=rideontime[index];
                      e.properties["getofftime"]=getofftime[index];
                      e.properties["exceptionserviceday"]=exceptionserviceday[index]; // = に修正
                      e.properties["route"]=route[index]; // = に修正
                      e.properties["agency"]=agency[index]; // = に修正
                      break; // マッチしたら終了
                    }
                    }
                  }
                return e;
              })
              .filter((e)=>{return e.properties["hour"]==s1&&e.properties["ridingtime"] >=60})
            const data2r = result.features
              .map((e) => {
                // プロパティ初期化
                e.properties["to"] = null;
                e.properties["weekday"] = null;
                e.properties["hour"] = null;
                e.properties["direct"] = null;
                e.properties["dest"] = null;
                e.properties["origdest"] = null;
                e.properties["rideonstop"] = [];
                e.properties["getoffstop"] = [];
                e.properties["ridingtime"] = [];
                e.properties["rideontime"] = [];
                e.properties["getofftime"] =[];
                e.properties["exceptionserviceday"] = [];
                e.properties["route"] = [];
                e.properties["agency"] = [];
                e.properties["dimention"] = [];
                // データをマッチさせて更新
                
                for (const i of flag) {
                    
                  if (i["condition"]["weekday"][s02]==="1"&&i["condition"]["direct"]==="direct"){
                    const flagr0 = i["data"].map(item => item.meshid);
                    e.properties["dimention"] = i["condition"]["dimention"];
                    e.properties["to"] = i["condition"]["to"];
                    e.properties["dest"] = i["condition"]["to"];
                    e.properties["weekday"] = i["condition"]["weekday"];
                    e.properties["hour"] = i["condition"]["hour"];
                    e.properties["direct"] = d2;
                    e.properties["dest"] = d3;
                    let rideonstop=i["data"].map(u=>u.rideonstop);
                    let getoffstop=i["data"].map(u=>u.getoffstop);
                    let ridingtime=i["data"].map(u=>u.ridingtime);
                    let rideontime=i["data"].map(u=>u.rideontime);
                    let getofftime=i["data"].map(u=>u.getofftime);
                    let exceptionserviceday=i["data"].map(u=>u.exceptionserviceday);
                    let route=i["data"].map(u=>u.route);
                    let agency=i["data"].map(u=>u.agency);
                    let index=flagr0.findIndex(row => row.includes(e.properties["MESH_ID"]));
                    if (index!=-1){
                      e.properties["rideonstop"]=rideonstop[index];
                      e.properties["getoffstop"]=getoffstop[index];
                      e.properties["ridingtime"]=ridingtime[index];
                      e.properties["rideontime"]=rideontime[index];
                      e.properties["getofftime"]=getofftime[index];
                      e.properties["exceptionserviceday"]=exceptionserviceday[index]; // = に修正
                      e.properties["route"]=route[index]; // = に修正
                      e.properties["agency"]=agency[index]; // = に修正
                      break; // マッチしたら終了
                    }
                    }
                  }
                return e;
              })
              //&&bounds[0] <= x1 && x2 <= bounds[2] && bounds[1] <= y1 && y2 <= bounds[3]
            const filteredGeoJSON = {
              type: "FeatureCollection",
              features: data1r
            };
            
            setRidingtime(data1r);
            setRidingtimeall(data2r);
              let datav=Array.isArray(d1) && d1.length > 1 ? d1[1] : true;
              const isActive =layercheck === "タイムスライダー"?true:datav;
              const dest00=d1.hasOwnProperty(d)?d1[d][5]:d1[5];
              let ratiolist=[];
              let valuelist=[];
              const layer=new GeoJsonLayer({
                id: ly,
                data: filteredGeoJSON,
                visible:isActive,
                stroked: false,
                filled: (d) => d.properties["ridingtime"] >=60,
                getFillColor: (d)=>{
                  const hasValue = d.properties["ridingtime"] >=60
                  const ratio = d.properties["ridingtime"] >=60?parseInt(d.properties["ridingtime"]) / 10:0;
                  
                  // 条件外は完全透明
                  if (d.properties["ridingtime"] <60) return [0, 0, 0, 0]

                  // 値がない場合も透明
                  if (dest00==dest&&d.properties["ridingtime"] >=60) return [0, 0, 0, 0]
                    // 濃い赤 [180,0,0] → 薄い赤 [255,200,200]
                  const r =81-ratio>4?81-ratio:4  // 180 → 255
                  const g = 170-ratio>37?170-ratio:37    // 0 → 200
                  const b =238-ratio>130?238-ratio:130         // 0 → 200
                  ratiolist.push([[r, g, b, 200],parseInt(parseInt(d.properties["ridingtime"])/ 60)]);
                  isActive?setLegends(ratiolist):null;
                  return [r, g, b, 200]
                },
                pickable: hover==="所要時間"?true:false,
                autoHighlight: hover==="所要時間"?true:false,
                parameters: {
                  depthTest: false,
                  blend: false,
                },
                
                // Callback when the pointer enters or leaves an object
                onClick: (info, event) => {
                  try{
                  console.log('Clicked:',info.object.properties[s0]);
                  setClicknearestridetime(info.object.properties[s0]);
                  setClicknearestgetofftime(info.object.properties[s1]);
                  setClickneareststop(info.object.properties[stop]);
                  setClicknearestbusline(info.object.properties["route"]);
                  console.log('Clicked:',info.object.properties[Area]);
                  setClickpopmeshaddress(info.object.properties[Area]);


                  } catch(e){
                    console.log(e.message);
                  }
                },
                updateTriggers: {
                  filled: [s],
                  getFillColor: [kind, layercheck, s],
                },
                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              layers_ridingrow.push(layer);
              const point=d1.hasOwnProperty(d)?d1[d][5]:d1[5];
              let data1p=[];
              for (const k of point){
                data1p.push({"name":k["stopname"],"coordinates":[k["stoplon"],k["stoplat"]]})
              }
              console.log(data1p);
              const ly1=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i+5}`;
              const dest0=d1.hasOwnProperty(d)?d1[d][5]:d1[5];
              const layerpoint=new IconLayer({
                id: ly1,
                getColor: d => [1, 0, 102],
                getIcon: d => 'marker',
                data: data1p,
                visible:layercheck === "タイムスライダー"&&dest0==dest?true:false,
                getPosition: d => d.coordinates,
                getSize: 40,
                iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
                iconMapping: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json',
                pickable: hover==="所要時間"?true:false,
                autoHighlight: hover==="所要時間"?true:false,
                parameters: {
                  depthTest: false,
                  blend: false,
                },

                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              layers_ridingrow.push(layerpoint);
              const ly2=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i*5+100}`;
              const dest01=d1.hasOwnProperty(d)?d1[d][5]:d1[5];
              const layertextpoint=new TextLayer({
                id: ly2,
                data: data1p,
                visible:layercheck === "タイムスライダー"&&dest01==dest?true:false,
                getPosition: d => d.coordinates,
                getText: d => d.name,
                characterSet: [...new Set(data1p.map(d => d.name).join(''))],

                getAlignmentBaseline: 'top',
                getColor: [1, 0, 102],
                getSize: 25,
                getTextAnchor: 'middle',
                pickable: hover==="所要時間"?true:false,
                getPixelOffset: [0, -70],  
                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              layers_ridingrow.push(layertextpoint);

            } else if (d === "ridingtime_transit") {
              const Area =area;
              let s = dest;
              let s0 = weekday;
              let s1 = parseInt(Math.round(time*100000000)+10);
              let s02=parseInt(weekdayflag)-1;
              const lyd=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}1`:`layer-${d}-${d1[0]}-${i}1`;
              const lyb=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}b`:`layer-${d}-${d1[0]}-${i}b`;
              let flag=[];
              if(layercheck!="複数レイヤー表示"){
              d1.hasOwnProperty(d)?flagall.push(d1[d][2]):flagall.push(d1[2]);

              
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
              flag=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
            }
            console.log(flag);
              const data1b = result.features
            .map((e) => {
              // プロパティ初期化
              e.properties["to"] = null;
              e.properties["weekday"] = null;
              e.properties["hour"] = null;
              e.properties["direct"] = null;
              e.properties["beforerideonstop"] = [];
              e.properties["beforegetoffstop"] = [];
              e.properties["beforeridingtime"] = [];
              e.properties["beforerideontime"] = [];
              e.properties["beforegetofftime"] =[];
              e.properties["beforeexceptionserviceday"] = [];
              e.properties["beforeroute"] = [];
              e.properties["beforeagency"] = [];
              e.properties["beforedimention"] = [];
              for (const i1 of flag) {
                
                for(let l in i1["data"]){
                  let flagb=[];
                  for (let l1 in i1["data"][l]){
                    for (let k in i1["data"][l][l1].beforemeshid){
                      flagb.push(i1["data"][l][l1].beforemeshid[k])
                      }
                  }
                  let rideonstop=i1["data"].map(u=>u.beforerideonstop);
                  let getoffstop=i1["data"].map(u=>u.beforegetoffstop);
                  let ridingtime=i1["data"].map(u=>u.beforeridingtime);
                  let rideontime=i1["data"].map(u=>u.beforerideontime);
                  let getofftime=i1["data"].map(u=>u.beforegetofftime);
                  let exceptionserviceday=i1["data"].map(u=>u.beforeexceptionserviceday);
                  let route=i1["data"].map(u=>u.route);
                  let agency=i1["data"].map(u=>u.agency);
                  let flag0b=flagb
                  let index=flag0b.findIndex(row => row.includes(e.properties["MESH_ID"]));
                    
                  if (index!=-1){
                    if (flag0b.has(e.properties["MESH_ID"])) {
                      e.properties["to"] = i1["condition"]["to"];
                      e.properties["weekday"] = i1["condition"]["weekday"];
                      e.properties["hour"] = i1["condition"]["hour"];
                      e.properties["direct"] = i1["condition"]["direct"];
                      e.properties["beforerideonstop"]=rideonstop[index];
                      e.properties["beforegetoffstop"]=getoffstop[index];
                      e.properties["beforeridingtime"]=ridingtime[index];
                      e.properties["beforerideontime"]=rideontime[index];
                      e.properties["beforegetofftime"]=getofftime[index];
                      e.properties["beforeexceptionserviceday"]=exceptionserviceday[index]; // = に修正
                      e.properties["beforeroute"]=route[index]; // = に修正
                      e.properties["beforeagency"]=agency[index]; // = に修正
                    }
                  }  
                }    
                
              }

            
              return e;
            }).filter((e)=>{return e.properties["to"]!=null})
            const beforeGeoJSON = {
              type: "FeatureCollection",
              features: data1b
            };
            const data1a = result.features
            .map((e) => {
              // プロパティ初期化
              e.properties["to"] = null;
              e.properties["weekday"] = null;
              e.properties["hour"] = null;
              e.properties["direct"] = null;
              e.properties["afterrideonstop"] = [];
              e.properties["aftergetoffstop"] = [];
              e.properties["afterridingtime"] = [];
              e.properties["afterrideontime"] = [];
              e.properties["aftergetofftime"] =[];
              e.properties["afterexceptionserviceday"] = [];
              e.properties["afterroute"] = [];
              e.properties["afteragency"] = [];
              e.properties["afterdimention"] = [];
              for (const i1 of flag) {
                
                for(let l in i1["data"]){
                  let flagb=[];
                  for (let l1 in i1["data"][l]){
                    for (let k in i1["data"][l][l1].aftermeshid){
                      flagb.push(i1["data"][l][l1].aftermeshid[k])
                      }
                  }
                  let rideonstop=i1["data"].map(u=>u.afterrideonstop);
                  let getoffstop=i1["data"].map(u=>u.aftergetoffstop);
                  let ridingtime=i1["data"].map(u=>u.afterridingtime);
                  let rideontime=i1["data"].map(u=>u.afterrideontime);
                  let getofftime=i1["data"].map(u=>u.aftergetofftime);
                  let exceptionserviceday=i1["data"].map(u=>u.afterexceptionserviceday);
                  let route=i1["data"].map(u=>u.route);
                  let agency=i1["data"].map(u=>u.agency);
                  let flag0b=flagb
                  let index=flag0b.findIndex(row => row.includes(e.properties["MESH_ID"]));
                    
                  if (index!=-1){
                    if (flag0b.has(e.properties["MESH_ID"])) {
                      e.properties["to"] = i1["condition"]["to"];
                      e.properties["weekday"] = i1["condition"]["weekday"];
                      e.properties["hour"] = i1["condition"]["hour"];
                      e.properties["direct"] = i1["condition"]["direct"];
                      e.properties["afterrideonstop"]=rideonstop[index];
                      e.properties["aftergetoffstop"]=getoffstop[index];
                      e.properties["afterridingtime"]=ridingtime[index];
                      e.properties["afterrideontime"]=rideontime[index];
                      e.properties["aftergetofftime"]=getofftime[index];
                      e.properties["afterexceptionserviceday"]=exceptionserviceday[index]; // = に修正
                      e.properties["afterroute"]=route[index]; // = に修正
                      e.properties["afteragency"]=agency[index]; // = に修正
                    }
                  }  
                }    
                
              }

            
              return e;
            }).filter((e)=>{return e.properties["to"]!=null})
            //&&bounds[0] <= x1 && x2 <= bounds[2] && bounds[1] <= y1 && y2 <= bounds[3]
            const afterGeoJSON = {
              type: "FeatureCollection",
              features: data1a
            };
            console.log(beforeGeoJSON);
            //setRidingtime(directGeoJSON);
              const bisv=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
              const bisLayer = layercheck === "複数レイヤー表示"?true:false;
              const bisActive = kind === "所要時間"?true:false;
              
              let bratiolist=[];
              let bvaluelist=[];
              const blayer=new GeoJsonLayer({
                id: lyb,
                data: origdest==="dest"?beforeGeoJSON:afterGeoJSON,
                visible:layercheck === "複数レイヤー表示"?bisv:false,
                filled: true,//(d) => d.properties["ridingtime"] >=60,
                getFillColor: (d)=>{
                  const bhasValue = d.properties["ridingtime"] >=60
                  const bratio = d.properties["ridingtime"] >=60?parseInt(d.properties["ridingtime"]) / 10:0;
                  
                  // 複数表示は濃い赤
                    //if (bisLayer) return [0, 128, 0, 200]
                  // 条件外は完全透明
                    //if (d.properties["ridingtime"] <60) return [0, 0, 0, 0]

                  // 値がない場合も透明
                    //if (!bhasValue) return [0, 0, 0, 0]
                    // 濃い赤 [180,0,0] → 薄い赤 [255,200,200]
                  const r = 255-bratio   // 180 → 255
                  const g = 255      // 0 → 200
                  const b = bratio        // 0 → 200
                  bratiolist.push([[r, g, b, 200],parseInt(parseInt(d.properties["ridingtime"])/ 60)]);
                  bisActive?setLegends(ratiolist):null;
                  return [r, g, b, 200]
                },
                pickable: hover==="所要時間"?true:false,
                autoHighlight: hover==="所要時間"?true:false,
                parameters: {
                  depthTest: false,
                  blend: false,
                },
                
                // Callback when the pointer enters or leaves an object
                onClick: (info, event) => {
                  try{
                  console.log('Clicked:',info.object.properties[s0]);
                  setClicknearestridetime(info.object.properties[s0]);
                  setClicknearestgetofftime(info.object.properties[s1]);
                  setClickneareststop(info.object.properties[stop]);
                  setClicknearestbusline(info.object.properties["route"]);
                  console.log('Clicked:',info.object.properties[Area]);
                  setClickpopmeshaddress(info.object.properties[Area]);


                  } catch(e){
                    console.log(e.message);
                  }
                },
                updateTriggers: {
                  filled: [s],
                  getFillColor: [kind, layercheck, s],
                },
                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              layers_row.push(blayer);
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
                
                for(let l in i1["data"]){
                  let flagb=[];
                  for (let l1 in i1["data"][l]){
                    for (let k in i1["data"][l][l1].directmeshid){
                      flagb.push(i1["data"][l][l1].directmeshid[k])
                      }
                  }
                  let rideonstop=i1["data"].map(u=>u.rideonstop);
                  let getoffstop=i1["data"].map(u=>u.getoffstop);
                  let ridingtime=i1["data"].map(u=>u.ridingtime);
                  let rideontime=i1["data"].map(u=>u.rideontime);
                  let getofftime=i1["data"].map(u=>u.getofftime);
                  let exceptionserviceday=i1["data"].map(u=>u.exceptionserviceday);
                  let route=i1["data"].map(u=>u.route);
                  let agency=i1["data"].map(u=>u.agency);
                  let flag0b=flagb
                  let index=flag0b.findIndex(row => row.includes(e.properties["MESH_ID"]));
                    
                  if (index!=-1){
                    if (flag0b.has(e.properties["MESH_ID"])) {
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
                
              }

            
              return e;
            }).filter((e)=>{return e.properties["to"]!=null})
            //&&bounds[0] <= x1 && x2 <= bounds[2] && bounds[1] <= y1 && y2 <= bounds[3]
            const directGeoJSON = {
              type: "FeatureCollection",
              features: data1d
            };
            setRidingtime(directGeoJSON);
              const isv=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
              const isLayer = layercheck === "複数レイヤー表示"?true:false;
              const isActive = kind === "所要時間"?true:false;
              
              let ratiolist=[];
              let valuelist=[];
              const layer=new GeoJsonLayer({
                id: lyd,
                data: directGeoJSON,
                visible:layercheck === "複数レイヤー表示"?isv:false,
                filled: true,//(d) => d.properties["ridingtime"] >=60,
                getFillColor: (d)=>{
                  const hasValue = d.properties["ridingtime"] >=60
                  const ratio = d.properties["ridingtime"] >=60?parseInt(d.properties["ridingtime"]) / 10:0;
                  
                  // 複数表示は濃い赤
                  if (isLayer) return [0, 128, 0, 200]
                  // 条件外は完全透明
                  if (d.properties["ridingtime"] <60) return [0, 0, 0, 0]

                  // 値がない場合も透明
                  if (!hasValue) return [0, 0, 0, 0]
                    // 濃い赤 [180,0,0] → 薄い赤 [255,200,200]
                  const r = 255-ratio   // 180 → 255
                  const g = 255      // 0 → 200
                  const b = ratio        // 0 → 200
                  ratiolist.push([[r, g, b, 200],parseInt(parseInt(d.properties["ridingtime"])/ 60)]);
                  isActive?setLegends(ratiolist):null;
                  return [r, g, b, 200]
                },
                pickable: hover==="所要時間"?true:false,
                autoHighlight: hover==="所要時間"?true:false,
                parameters: {
                  depthTest: false,
                  blend: false,
                },
                
                // Callback when the pointer enters or leaves an object
                onClick: (info, event) => {
                  try{
                  console.log('Clicked:',info.object.properties[s0]);
                  setClicknearestridetime(info.object.properties[s0]);
                  setClicknearestgetofftime(info.object.properties[s1]);
                  setClickneareststop(info.object.properties[stop]);
                  setClicknearestbusline(info.object.properties["route"]);
                  console.log('Clicked:',info.object.properties[Area]);
                  setClickpopmeshaddress(info.object.properties[Area]);


                  } catch(e){
                    console.log(e.message);
                  }
                },
                updateTriggers: {
                  filled: [s],
                  getFillColor: [kind, layercheck, s],
                },
                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              layers_row.push(layer);

          
              const point=d1.hasOwnProperty(d)?d1[d][5]:d1[5];
              let data1p=[];
              for (let k in point){
                data1p.push({"name":point[k]["stopname"],"coordinates":[point[k]["stoplon"],point[k]["stoplat"]]})
              }
              const isv0=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
              const ly1=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i+5}`;
              const layerpoint=new IconLayer({
                id: ly1,
                getColor: d => [1, 0, 102],
                getIcon: d => 'marker',
                data: data1p,
                visible:layercheck === "複数レイヤー表示"?isv0:false,
                getPosition: d => d.coordinates,
                getSize: 40,
                iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
                iconMapping: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json',
                pickable: hover==="所要時間"?true:false,
                autoHighlight: hover==="所要時間"?true:false,
                parameters: {
                  depthTest: false,
                  blend: false,
                },

                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              console.log(layerpoint);
              layers_row.push(layerpoint);
              const ly2=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i*5+100}`;
              const isv1=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
              const layertextpoint=new TextLayer({
                id: ly2,
                data: data1p,
                visible:layercheck === "複数レイヤー表示"?isv1:false,
                getPosition: d => d.coordinates,
                getText: d => d.name,
                characterSet: [...new Set(data1p.map(d => d.name).join(''))],

                getAlignmentBaseline: 'top',
                getColor: [1, 0, 102],
                getSize: 25,
                getTextAnchor: 'middle',
                pickable: hover==="所要時間"?true:false,
                getPixelOffset: [0, -70],  
                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              console.log(layertextpoint);
              layers_row.push(layertextpoint);

            } else if (d === "fare") {
              let e=parseInt(Math.round(time*100000000)+11);
              let s = `${dest}_${weekday}_${e}_getofffare_direct`;
              //console.log(dest,weekday,Math.round(time*100000000)+5);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              console.log(kind);
              let datav=Array.isArray(d1) && d1.length > 1 ? d1[1] : true;
              const isLayer = layercheck === "複数レイヤー表示";
              const isActive = kind === "運賃" && layercheck === "タイムスライダー"?true:false;
              let data1=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
              //const data1r=data1.features.filter((e)=>{return bounds[0]<=e.geometry.coordinates[0][0][0]||e.geometry.coordinates[0][2][0]<=bounds[2]||bounds[1]<=e.geometry.coordinates[0][0][1]||e.geometry.coordinates[0][2][1]<=bounds[3]});
              const data1r=data1;
              console.log(isActive,data1,datav);
              let ratiolist=[];
              const layer=new GeoJsonLayer({
                id: ly,
                data: isActive?data1r:data1,
                visible:isActive?true:datav,
                stroked: false,
                autoHighlight: hover==="運賃"?true:false,
                parameters: {
                  depthTest: false,
                  blend: false,
                },
                getFillColor: (d)=>{
                  const hasValue = d.properties[s] != null

                  const ratio = Math.min(parseInt(d.properties[s]) / 1000, 1)

                  // 複数表示は濃い青
                  if (isLayer) return [0, 0, 255, 200]
                  // 条件外は完全透明
                  if (!isActive) return [0, 0, 0, 200]

                  // 値がない場合も透明
                  if (!hasValue) return [0, 0, 0, 0]
                  const r = Math.floor(ratio * 135)  // 200 → 0
                  const g = Math.floor(ratio * 196)   // 255 → 180
                  const b =255  // 200 → 0
                  ratiolist.push([[r, g, b, 200],parseInt(d.properties[s])]);
                  isActive?setLegends(ratiolist):null;
                  return [r, g, b, 200]
                },
                getLineWidth:15,
                pickable: hover==="運賃"?true:false,
                updateTriggers: {
                  filled: [s],
                  getFillColor: [kind, layercheck, s]
                },
                
                // Callback when the pointer enters or leaves an object
                onClick: (info, event) => {
                  try{
                    //console.log('Clicked:',info.object.properties);
                    //console.log('Clicked:',info.object.s);
                  setFare(info.object.s);


                  } catch(e){
                    //console.log(e.message);
                  }
                },
                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              layers_row.push(layer);}
          }}
        }
      }
    }
    return layers_ridingrow},[layercheck,time,dest,weekday,weekdayflag])
  
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
    console.log(pop);
      if (!data) return [];
      if (data["railline"]) {
        console.log("📋 useMemo内 data[railline]:", data["railline"]);
      }
      const layers_row = [];
      // ★data が更新されたことをここで検知
      console.log("🔄 useMemo re-running, data updated:", data);
      const layer = new TileLayer({
    id: 'gsi-tile-layer',
    // 先ほどエラーになった {t} を 'std' に、{ext} を 'png' に固定します
    // deck.gl は {z}, {x}, {y} を自動で解釈してリクエストします
    data: mapstyle,
    
    // 地理院タイルの仕様に合わせて設定します（標準地図は最大ズーム18）
    maxZoom: 18,
    minZoom: 0,

    // 取得したタイル画像をBitmapLayerとして描画する
    renderSubLayers: props => {
      const { boundingBox } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [
          boundingBox[0][0], // left
          boundingBox[0][1], // bottom
          boundingBox[1][0], // right
          boundingBox[1][1]  // top
        ]
      });
    }
  });
    layers_row.push(layer);
    // Contextから現在の状態を引っこ抜く（これが最強の同期方法）
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
            if (d === "facility"){
                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
                console.log(d1);
                const d02=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
                const d01=Array.isArray(d1) && d1.length > 1 ? d1[1] : true;
                const layer=new GeoJsonLayer({
                id: ly,
                data: d02,
                visible:d01,
                stroked: false,
                pointType: "circle", 
                getPointRadius:5,
                getFillColor:[255, 0, 0, 200],
                getPosition: d => d.coordinates,
                //getText: (d) => d.properties.FIXEDID,
                onClick: (info, event) => {
                try{
                  setClickstop(info.object.properties.name);
                  //console.log('Clicked:',info.object.properties);

                } catch(e){
                  //console.log(e.message);
                }},
                getLineColor: [0, 0, 0],
                getLineWidth: 10,
                getTextColor: [180, 0, 0],
                textFontWeight: "bold",
                pickable: hover==="施設"?true:false
              })
              layers_row.push(layer);
              
            } else if (d === "road") {
              //console.log(d1[2]);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
              console.log(d1);
              const layer=new GeoJsonLayer({
                id: ly,
                data: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                visible:Array.isArray(d1) && d1.length > 1 ? d1[1] : true,
                stroked: false,
                filled: true,
                getFillColor: (d)=>[255, 0, 0],
                getLineColor: [255, 0, 0],
                getLineWidth:15,
                getText:(d)=>d.properties.lnno,
                getTextAlignmentBaseline:"center",
                pickable: hover==="道路"?true:false,
                onClick: (info, event) => {
                try{
                  setClicknearestbusline(info.object.properties.name.replace(/[^0-9]/g, ''));
                } catch(e){
                }
              }
              })
              layers_row.push(layer);
            } else if (d === "popmesh") {
              const data1=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
              //const data1r=data1.features.filter((e)=>{return e.properties[pop]>0&&dimentionset===dimention&&bounds[0]<=e.geometry.coordinates[0][0][0]&&e.geometry.coordinates[0][2][0]<=bounds[2]&&bounds[1]<=e.geometry.coordinates[0][0][1]&&e.geometry.coordinates[0][2][1]<=bounds[3]});
              const data1r=pop!=""?data1.features.filter((e)=>{return e.properties[pop]>0}):data1;
              
              //[西経, 南緯, 東経, 北緯]  [minLng, minLat, maxLng, maxLat]
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
              const isv=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
              const Area =area;
              const layer=new GeoJsonLayer({
              id: ly,
              data: data1r,
              visible:layercheck==="複数レイヤー表示"?isv:true,
            getFillColor: (d) => {
              const colorValue = pop!=""?parseInt(d.properties[pop]):0;
        
              return layercheck==="複数レイヤー表示"?[255, 255 - colorValue, 0, 100]:[255,255,255,100];
            },
              filled:true,
              autoHighlight: hover==="居住地"?true:false,
              parameters: {
                depthTest: false,
                blend: false,
              },
              
                updateTriggers: {
                  visible:d[1]
                },
              stroked: false,
              pickable: hover==="居住地"?true:false,
                onClick: (info, event) => {
                try{
                  console.log(info.object.properties.PT00_2025);
                  setClickpopmesh(parseInt(info.object.properties.PT00_2025));
                  console.log(info.object.properties[Area]);
                  setClickpopmeshaddress(info.object.properties[Area]);

                } catch(e){
                  console.log(e.message);
                }}
              // Callback when the pointer enters or leaves an object
              // Callback when the pointer clicks on an object
              //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              layers_row.push(layer);
  
            } else if (d === "spatialbuffer") {
              const Area =area;
              const isLayer = layercheck === "複数レイヤー表示";
              //console.log(d1[2]);
              //popmeshkey=[[key,data]]
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              const data1=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
              //const data1r=data1.features.filter((e)=>{return bounds[0]<=e.geometry.coordinates[0][0][0]&&e.geometry.coordinates[0][2][0]<=bounds[2]&&bounds[1]<=e.geometry.coordinates[0][0][1]&&e.geometry.coordinates[0][2][1]<=bounds[3]});
              const data1r=data1;
              //[西経, 南緯, 東経, 北緯]  [minLng, minLat, maxLng, maxLat]
              console.log(data1r.length);
              let datav=Array.isArray(d1) && d1.length > 1 ? d1[1] : true;
                
              const layer=new GeoJsonLayer({
                id: ly,
                data: data1r,
                visible:!isLayer?false:datav,
                getFillColor: [0,0, 255, 100],
                filled:true,
                pickable: hover==="最寄バス停"?true:false,
                autoHighlight: hover==="最寄バス停"?true:false,
                stroked: false,
                parameters: {
                  depthTest: false,
                  blend: false,
                },
                // Callback when the pointer enters or leaves an object
                onClick: (info, event) => {
                try{
                  setClickneareststop(info.object.properties.stop_name);
                  setClickpopmeshaddress(info.object.properties[Area]);

                } catch(e){
                  console.log(e.message);
                }
                
                  
                },
                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              layers_row.push(layer);
            } else if (d === "ridingtime_direct") {
              
          const Area =area;
          let s = dest;
          let s0 = weekday;
          let s1 = parseInt(Math.round(time*100000000)+10);
          let s2="direct";
          let s02=parseInt(weekdayflag)-1;
          const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
          let flag=[];
          if(layercheck!="複数レイヤー表示"){
          d1.hasOwnProperty(d)?flagall.push(d1[d][2]):flagall.push(d1[2]);

          
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
          d1.hasOwnProperty(d)?flag=d1[d][2]:flag=d1[2];
        }
          const data1r = result.features
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
            // データをマッチさせて更新
            
            for (const i of flag) {
              let flagr=i["data"].flatMap(u=>u.meshid);
              let flag0=new Set(flagr);
                if(layercheck==="複数レイヤー表示"){
                  if (flag0.has(e.properties["MESH_ID"])) {
                    e.properties["dimention"] = i["condition"]["dimention"];
                    e.properties["to"] = i["condition"]["to"];
                    e.properties["weekday"] = i["condition"]["weekday"];
                    e.properties["hour"] = i["condition"]["hour"];
                    e.properties["direct"] = i["condition"]["direct"];
                    break; // マッチしたら終了
                  }
                } 
                  
              }
            return e;
          })
          //&&bounds[0] <= x1 && x2 <= bounds[2] && bounds[1] <= y1 && y2 <= bounds[3]
        const filteredGeoJSON = {
          type: "FeatureCollection",
          features: data1r
        };
        setRidingtime(filteredGeoJSON);
          const isv=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
          const isLayer = layercheck === "複数レイヤー表示"?true:false;
          const isActive = kind === "所要時間"?true:false;
          
          let ratiolist=[];
          let valuelist=[];
          const layer=new GeoJsonLayer({
            id: ly,
            data: filteredGeoJSON,
            visible:layercheck === "複数レイヤー表示"?isv:false,
            stroked: false,
            filled: (d) => d.properties["ridingtime"] >=60,
            getFillColor: (d)=>{
              const hasValue = d.properties["ridingtime"] >=60
              const ratio = d.properties["ridingtime"] >=60?parseInt(d.properties["ridingtime"]) / 10:0;
              
              // 複数表示は濃い赤
              if (isLayer) return [0, 128, 0, 200]
              // 条件外は完全透明
              if (d.properties["ridingtime"] <60) return [0, 0, 0, 0]

              // 値がない場合も透明
              if (!hasValue) return [0, 0, 0, 0]
                // 濃い赤 [180,0,0] → 薄い赤 [255,200,200]
              const r = 255-ratio   // 180 → 255
              const g = 255      // 0 → 200
              const b = ratio        // 0 → 200
              ratiolist.push([[r, g, b, 200],parseInt(parseInt(d.properties["ridingtime"])/ 60)]);
              isActive?setLegends(ratiolist):null;
              return [r, g, b, 200]
            },
            pickable: hover==="所要時間"?true:false,
            autoHighlight: hover==="所要時間"?true:false,
            parameters: {
              depthTest: false,
              blend: false,
            },
            
            // Callback when the pointer enters or leaves an object
            onClick: (info, event) => {
              try{
              console.log('Clicked:',info.object.properties[s0]);
              setClicknearestridetime(info.object.properties[s0]);
              setClicknearestgetofftime(info.object.properties[s1]);
              setClickneareststop(info.object.properties[stop]);
              setClicknearestbusline(info.object.properties["route"]);
              console.log('Clicked:',info.object.properties[Area]);
              setClickpopmeshaddress(info.object.properties[Area]);


              } catch(e){
                console.log(e.message);
              }
            },
            updateTriggers: {
              filled: [s],
              getFillColor: [kind, layercheck, s],
            },
            // Callback when the pointer clicks on an object
            //onClick: (info, event) => //console.log('Clicked:', info, event)
          })
          layers_row.push(layer);
          const point=d1.hasOwnProperty(d)?d1[d][5]:d1[5];
          let data1p=[];
          for (let k in point){
            data1p.push({"name":point[k]["stopname"],"coordinates":[point[k]["stoplon"],point[k]["stoplat"]]})
          }
          const isv0=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
          const ly1=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i+5}`;
          const layerpoint=new IconLayer({
            id: ly1,
            getColor: d => [1, 0, 102],
            getIcon: d => 'marker',
            data: data1p,
            visible:layercheck === "複数レイヤー表示"?isv0:false,
            getPosition: d => d.coordinates,
            getSize: 40,
            iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
            iconMapping: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json',
            pickable: hover==="所要時間"?true:false,
            autoHighlight: hover==="所要時間"?true:false,
            parameters: {
              depthTest: false,
              blend: false,
            },

            // Callback when the pointer clicks on an object
            //onClick: (info, event) => //console.log('Clicked:', info, event)
          })
          console.log(layerpoint);
          layers_row.push(layerpoint);
          const ly2=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i*5+100}`;
          const isv1=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
          const layertextpoint=new TextLayer({
            id: ly2,
            data: data1p,
            visible:layercheck === "複数レイヤー表示"?isv1:false,
            getPosition: d => d.coordinates,
            getText: d => d.name,
            characterSet: [...new Set(data1p.map(d => d.name).join(''))],

            getAlignmentBaseline: 'top',
            getColor: [1, 0, 102],
            getSize: 25,
            getTextAnchor: 'middle',
            pickable: hover==="所要時間"?true:false,
            getPixelOffset: [0, -70],  
            // Callback when the pointer clicks on an object
            //onClick: (info, event) => //console.log('Clicked:', info, event)
          })
          console.log(layertextpoint);
          layers_row.push(layertextpoint);

        }  else if (d === "frequency_on_routes") {
              const Area =area;
              //console.log(d1[2]);
              let s = `JR西条駅_${weekday}_${Math.round(time*100000000)+5}_frequency_direct`;
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              const data1=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
              //const data1r=data1.features.filter((e)=>{return bounds[0]<=e.geometry.coordinates[0][0][0]||e.geometry.coordinates[0][2][0]<=bounds[2]||bounds[1]<=e.geometry.coordinates[0][0][1]||e.geometry.coordinates[0][2][1]<=bounds[3]});
              const data1r=data1;
              console.log(data1r.length);
              const layer=new GeoJsonLayer({
                id: ly,
                data: data1r,
                visible:kind=="運行本数"&&layercheck=="タイムスライダー"?true:Array.isArray(d1) && d1.length > 1 ? d1[1] : true,
                getFillColor: (d)=>[0,kind=="運行本数"&&layercheck=="タイムスライダー"&&d.properties[s]!=null?153-Math.floor(parseInt(d.properties[s])/5*153):0,kind=="運行本数"&&layercheck=="タイムスライダー"&&d.properties[s]!=null?204-Math.floor(parseInt(d.properties[s])/5*204):0, kind=="運行本数"&&layercheck=="タイムスライダー"&&d.properties[s]!=null?255-Math.floor(parseInt(d.properties[s])/10*255):0,100],
                getLineColor: (d,)=>[0,0,0, 0],
                getLineWidth:15,
                stroked: false,
                pickable: hover==="運行本数"?true:false,
                autoHighlight: hover==="運行本数"?true:false,
                parameters: {
                  depthTest: false,
                  blend: false,
                },
                filled:true,
                // Callback when the pointer enters or leaves an object
                onClick: (info, event) => {
                try{
                  console.log(info.object.properties.stop_name);
                  setClickneareststop(info.object.properties.stop_name);
                  setClickpopmeshaddress(info.object.properties[Area]);

                } catch(e){
                  //console.log(e.message);
                }
                
                  
                },


                updateTriggers: {
                filled: [s],        // s（文字列）が変わったら filled を再計算
                getFillColor: [s]   // s（文字列）が変わったら getFillColor を再計算
                },
                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              layers_row.push(layer);
              console.log(layer.props.pickable);
            } else if (d === "ridingtime_transit") {
              const Area =area;
              let s = dest;
              let s0 = weekday;
              let s1 = parseInt(Math.round(time*100000000)+10);
              let s2="direct";
              let s02=parseInt(weekdayflag)-1;
              const lyd=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}1`:`layer-${d}-${d1[0]}-${i}1`;
              const lyb=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}b`:`layer-${d}-${d1[0]}-${i}b`;
              let flag=[];
              if(layercheck!="複数レイヤー表示"){
              d1.hasOwnProperty(d)?flagall.push(d1[d][2]):flagall.push(d1[2]);

              
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
              flag=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
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
                
                for(let l in i1["data"]){
                  let flagb=[];
                  for (let l1 in i1["data"][l]){
                    for (let k in i1["data"][l][l1].beforemeshid){
                      flagb.push(i1["data"][l][l1].beforemeshid[k])
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
              const bisv=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
              const bisLayer = layercheck === "複数レイヤー表示"?true:false;
              const bisActive = kind === "所要時間"?true:false;
              
              let bratiolist=[];
              let bvaluelist=[];
              const blayer=new GeoJsonLayer({
                id: lyb,
                data: beforeGeoJSON,
                visible:layercheck === "複数レイヤー表示"?bisv:false,
                filled: true,//(d) => d.properties["ridingtime"] >=60,
                getFillColor: (d)=>{
                  const bhasValue = d.properties["ridingtime"] >=60
                  const bratio = d.properties["ridingtime"] >=60?parseInt(d.properties["ridingtime"]) / 10:0;
                  
                  // 複数表示は濃い赤
                   //if (bisLayer) return [0, 128, 0, 200]
                  // 条件外は完全透明
                   //if (d.properties["ridingtime"] <60) return [0, 0, 0, 0]

                  // 値がない場合も透明
                   //if (!bhasValue) return [0, 0, 0, 0]
                    // 濃い赤 [180,0,0] → 薄い赤 [255,200,200]
                  const r = 255-bratio   // 180 → 255
                  const g = 255      // 0 → 200
                  const b = bratio        // 0 → 200
                  bratiolist.push([[r, g, b, 200],parseInt(parseInt(d.properties["ridingtime"])/ 60)]);
                  bisActive?setLegends(ratiolist):null;
                  return [255,0, 0, 200]
                },
                pickable: hover==="所要時間"?true:false,
                autoHighlight: hover==="所要時間"?true:false,
                parameters: {
                  depthTest: false,
                  blend: false,
                },
                
                // Callback when the pointer enters or leaves an object
                onClick: (info, event) => {
                  try{
                  console.log('Clicked:',info.object.properties[s0]);
                  setClicknearestridetime(info.object.properties[s0]);
                  setClicknearestgetofftime(info.object.properties[s1]);
                  setClickneareststop(info.object.properties[stop]);
                  setClicknearestbusline(info.object.properties["route"]);
                  console.log('Clicked:',info.object.properties[Area]);
                  setClickpopmeshaddress(info.object.properties[Area]);


                  } catch(e){
                    console.log(e.message);
                  }
                },
                updateTriggers: {
                  filled: [s],
                  getFillColor: [kind, layercheck, s],
                },
                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
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
                
                for(let l in i1["data"]){
                  let flagb=[];
                  for (let l1 in i1["data"][l]){
                    for (let k in i1["data"][l][l1].directmeshid){
                      flagb.push(i1["data"][l][l1].directmeshid[k])
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
              const isv=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
              const isLayer = layercheck === "複数レイヤー表示"?true:false;
              const isActive = kind === "所要時間"?true:false;
              
              let ratiolist=[];
              let valuelist=[];
              const layer=new GeoJsonLayer({
                id: lyd,
                data: directGeoJSON,
                visible:layercheck === "複数レイヤー表示"?isv:false,
                filled: true,//(d) => d.properties["ridingtime"] >=60,
                getFillColor: (d)=>{
                  const hasValue = d.properties["ridingtime"] >=60
                  const ratio = d.properties["ridingtime"] >=60?parseInt(d.properties["ridingtime"]) / 10:0;
                  
                  // 複数表示は濃い赤
                  if (isLayer) return [0, 128, 0, 200]
                  // 条件外は完全透明
                  if (d.properties["ridingtime"] <60) return [0, 0, 0, 0]

                  // 値がない場合も透明
                  if (!hasValue) return [0, 0, 0, 0]
                    // 濃い赤 [180,0,0] → 薄い赤 [255,200,200]
                  const r = 255-ratio   // 180 → 255
                  const g = 255      // 0 → 200
                  const b = ratio        // 0 → 200
                  ratiolist.push([[r, g, b, 200],parseInt(parseInt(d.properties["ridingtime"])/ 60)]);
                  isActive?setLegends(ratiolist):null;
                  return [0, 128, 0, 200]
                },
                pickable: hover==="所要時間"?true:false,
                autoHighlight: hover==="所要時間"?true:false,
                parameters: {
                  depthTest: false,
                  blend: false,
                },
                
                // Callback when the pointer enters or leaves an object
                onClick: (info, event) => {
                  try{
                  console.log('Clicked:',info.object.properties[s0]);
                  setClicknearestridetime(info.object.properties[s0]);
                  setClicknearestgetofftime(info.object.properties[s1]);
                  setClickneareststop(info.object.properties[stop]);
                  setClicknearestbusline(info.object.properties["route"]);
                  console.log('Clicked:',info.object.properties[Area]);
                  setClickpopmeshaddress(info.object.properties[Area]);


                  } catch(e){
                    console.log(e.message);
                  }
                },
                updateTriggers: {
                  filled: [s],
                  getFillColor: [kind, layercheck, s],
                },
                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              layers_row.push(layer);

         
              const point=d1.hasOwnProperty(d)?d1[d][5]:d1[5];
              let data1p=[];
              for (let k in point){
                data1p.push({"name":point[k]["stopname"],"coordinates":[point[k]["stoplon"],point[k]["stoplat"]]})
              }
              const isv0=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
              const ly1=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i+5}`;
              const layerpoint=new IconLayer({
                id: ly1,
                getColor: d => [1, 0, 102],
                getIcon: d => 'marker',
                data: data1p,
                visible:layercheck === "複数レイヤー表示"?isv0:false,
                getPosition: d => d.coordinates,
                getSize: 40,
                iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
                iconMapping: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json',
                pickable: hover==="所要時間"?true:false,
                autoHighlight: hover==="所要時間"?true:false,
                parameters: {
                  depthTest: false,
                  blend: false,
                },

                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              console.log(layerpoint);
              layers_row.push(layerpoint);
              const ly2=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i*5+100}`;
              const isv1=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
              const layertextpoint=new TextLayer({
                id: ly2,
                data: data1p,
                visible:layercheck === "複数レイヤー表示"?isv1:false,
                getPosition: d => d.coordinates,
                getText: d => d.name,
                characterSet: [...new Set(data1p.map(d => d.name).join(''))],

                getAlignmentBaseline: 'top',
                getColor: [1, 0, 102],
                getSize: 25,
                getTextAnchor: 'middle',
                pickable: hover==="所要時間"?true:false,
                getPixelOffset: [0, -70],  
                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              console.log(layertextpoint);
              layers_row.push(layertextpoint);

            } else if (d === "fare") {
              let e=parseInt(Math.round(time*100000000)+11);
              let s = `${dest}_${weekday}_${e}_getofffare_direct`;
              //console.log(dest,weekday,Math.round(time*100000000)+5);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              console.log(kind);
              let datav=Array.isArray(d1) && d1.length > 1 ? d1[1] : true;
              const isLayer = layercheck === "複数レイヤー表示";
              const isActive = kind === "運賃" && layercheck === "タイムスライダー"?true:false;
              let data1=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
              //const data1r=data1.features.filter((e)=>{return bounds[0]<=e.geometry.coordinates[0][0][0]||e.geometry.coordinates[0][2][0]<=bounds[2]||bounds[1]<=e.geometry.coordinates[0][0][1]||e.geometry.coordinates[0][2][1]<=bounds[3]});
              const data1r=data1;
              console.log(isActive,data1,datav);
              let ratiolist=[];
              const layer=new GeoJsonLayer({
                id: ly,
                data: isActive?data1r:data1,
                visible:isActive?true:datav,
                stroked: false,
                autoHighlight: hover==="運賃"?true:false,
                parameters: {
                  depthTest: false,
                  blend: false,
                },
                getFillColor: (d)=>{
                  const hasValue = d.properties[s] != null

                  const ratio = Math.min(parseInt(d.properties[s]) / 1000, 1)

                  // 複数表示は濃い青
                  if (isLayer) return [0, 0, 255, 200]
                  // 条件外は完全透明
                  if (!isActive) return [0, 0, 0, 200]

                  // 値がない場合も透明
                  if (!hasValue) return [0, 0, 0, 0]
                  const r = Math.floor(ratio * 135)  // 200 → 0
                  const g = Math.floor(ratio * 196)   // 255 → 180
                  const b =255  // 200 → 0
                  ratiolist.push([[r, g, b, 200],parseInt(d.properties[s])]);
                  isActive?setLegends(ratiolist):null;
                  return [r, g, b, 200]
                },
                getLineWidth:15,
                pickable: hover==="運賃"?true:false,
                updateTriggers: {
                  filled: [s],
                  getFillColor: [kind, layercheck, s]
                },
                
                // Callback when the pointer enters or leaves an object
                onClick: (info, event) => {
                  try{
                    //console.log('Clicked:',info.object.properties);
                    //console.log('Clicked:',info.object.s);
                  setFare(info.object.s);


                  } catch(e){
                    //console.log(e.message);
                  }
                },
                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              layers_row.push(layer);

            } else if (d === "lipt"){
              console.log(d1);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              
              const layer=new GeoJsonLayer({
                id: ly,
                data: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                visible:Array.isArray(d1) && d1.length > 1 ? d1[1] : true,
                stroked: false,
                filled: (d)=>[d.properties.totalAI>0?true:falsee],
                parameters: {
                  depthTest: false,
                  blend: false,
                },
                getFillColor: (d)=>[0, d.properties.totalAI>0?parseInt(d.properties.totalAI)*35:0,d.properties.totalAI>0?parseInt(d.properties.totalAI)*35:0, d.properties.totalAI>0?100:0],
                pickable: hover==="lipt"?true:false,
                // Callback when the pointer enters or leaves an object
                // Callback when the pointer clicks on an object
                //onClick: (info, event) => console.log('Clicked:', info.object.properties)
              })
              layers_row.push(layer);
            } else if (d === "editline") {
              let colorl=[];
              console.log(d1);
              let d1r=d1.hasOwnProperty(d)?d1[d]:d1;
              let d1r2;
              d1r2=d1r;

              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`editlayer-${d}-${i}`;
              const layer=new GeoJsonLayer({
              id: ly,
              data: d1r2,
              visible:true,
              stroked: true,
              filled: true,
              getLineColor: (d)=>[ 136, 72,152],
              getLineWidth:35,
              getText:(d)=>d.properties.lnno,
                parameters: {
                  depthTest: false,
                  blend: false,
                },
              getTextAlignmentBaseline:"center",
              pickable: hover==="バス路線"?true:false,
              onClick: (info, event) => {
              try{
                    setClicknearestbusline(info.object.properties.name.replace(/[^0-9]/g, ''));

              } catch(e){
              }}})
            
            } else if (d === "tram") {
              let colorl=[];
              console.log(d1);
              let d1r=d1.hasOwnProperty(d)?d1[d]:d1;
              let d1r2;
              try{
                console.log(d1r[2]);
                d1r2=d1r[2];
                for (const d2 of d1r[2].features){
                  colorl.push(d2.properties.name);
                }

              } catch{
                console.log(d1r[0][2]);
                d1r2=d1r[0][2];
                for (const d2 of d1r[0][2].features){
                  colorl.push(d2.properties.name);
                }
                
              } 
              let newcol= [...new Set(colorl)];

              console.log(d1r2);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${i}`;
              const layer=new GeoJsonLayer({
              id: ly,
              data: d1r2,
              visible:true,
              stroked: true,
              filled: true,
              getFillColor: (d)=>[255, 0, 0,100],
              getLineColor: (d)=>[Math.floor(Math.random() * 255), 255-Math.floor(Math.random() * 255), 10],
              getLineWidth:35,
              getTextAlignmentBaseline:"center",
                parameters: {
                  depthTest: false,
                  blend: false,
                },
              pickable: hover==="路面電車"?true:false,
              onClick: (info, event) => {
              try{
                    setClicknearestbusline(info.object.properties.name.replace(/[^0-9]/g, ''));

              } catch(e){
              }}})
              layers_row.push(layer);
            } if (d === "railline") {
              const isVisible = Array.isArray(d1) && d1.length > 1 ? d1[1] : true;
              console.log("🎯 railline layer:", d1[0], "visible should be:", d1[1]);
              let colorl=[];
              console.log(d1[2]);
              let d1r=d1.hasOwnProperty(d)?d1[d]:d1;
              let newcol= [...new Set(colorl)];

              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${i}`;
              const layer=new GeoJsonLayer({
              id: ly,
              data: d1[2],
              visible:isVisible,
              stroked: true,
              filled: true,
              getFillColor: (d)=>[255, 0, 0,100],
              getLineColor: (d)=>[Math.floor(Math.random() * 255), 255-Math.floor(Math.random() * 255), 10],
              getLineWidth:35,
              getTextAlignmentBaseline:"center",
                parameters: {
                  depthTest: false,
                  blend: false,
                },
                updateTriggers: {
                visible: [d1[1]],  // d1[1] が変わったら再描画
              },
              pickable: hover==="路面電車"?true:false,
              onClick: (info, event) => {
              try{
                    setClicknearestbusline(info.object.properties.name.replace(/[^0-9]/g, ''));

              } catch(e){
              }}})
              if (isVisible) {
                  console.log("✅ 追加:", d1[0]);  // ★追加
                  layers_row.push(layer);
                } else {
                  console.log("❌ スキップ:", d1[0]);  // ★追加
                }
            } else if (d === "rosenbus") {
              let colorl=[];
              console.log(d1);
              let d1r=d1.hasOwnProperty(d)?d1[d]:d1;
              let d1r2;
              try{
                console.log(d1r[2]);
                d1r2=d1r[2];
                for (const d2 of d1r[2].features){
                  colorl.push(d2.properties.name);
                }

              } catch{
                console.log(d1r[0][2]);
                d1r2=d1r[0][2];
                for (const d2 of d1r[0][2].features){
                  colorl.push(d2.properties.name);
                }
                
              } 
              let newcol= [...new Set(colorl)];

              console.log(d1r2);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${i}`;
              const layer=new GeoJsonLayer({
              id: ly,
              data: d1r2,
              visible:Array.isArray(d1) && d1.length > 1 ? d1[1] : true,
              stroked: true,
              filled: true,
              getFillColor: (d)=>[255, 0, 0,100],
              getLineColor: (d)=>[Math.floor(Math.random() * 255), 255-Math.floor(Math.random() * 255), 10],
              getLineWidth:35,
              getTextAlignmentBaseline:"center",
                parameters: {
                  depthTest: false,
                  blend: false,
                },
              pickable: hover==="路線バス"?true:false,
              onClick: (info, event) => {
              try{
                    setClicknearestbusline(info.object.properties.name.replace(/[^0-9]/g, ''));

              } catch(e){
              }}})
              layers_row.push(layer);
            }else if (d === "highwaybus") {
              let colorl=[];
              console.log(d1);
              let d1r=d1.hasOwnProperty(d)?d1[d]:d1;
              let d1r2;
              try{
                console.log(d1r[2]);
                d1r2=d1r[2];
                for (const d2 of d1r[2].features){
                  colorl.push(d2.properties.name);
                }

              } catch{
                console.log(d1r[0][2]);
                d1r2=d1r[0][2];
                for (const d2 of d1r[0][2].features){
                  colorl.push(d2.properties.name);
                }
                
              } 
              let newcol= [...new Set(colorl)];

              console.log(d1r2);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${i}`;
              const layer=new GeoJsonLayer({
              id: ly,
              data: d1r2,
              visible:Array.isArray(d1) && d1.length > 1 ? d1[1] : true,
              stroked: true,
              filled: true,
              getFillColor: (d)=>[255, 0, 0,100],
              getLineColor: (d)=>[Math.floor(Math.random() * 255), 255-Math.floor(Math.random() * 255), 10],
              getLineWidth:35,
              getTextAlignmentBaseline:"center",
                parameters: {
                  depthTest: false,
                  blend: false,
                },
              pickable: hover==="高速バス"?true:false,
              onClick: (info, event) => {
              try{
                    setClicknearestbusline(info.object.properties.name.replace(/[^0-9]/g, ''));

              } catch(e){
              }}})
              layers_row.push(layer);
            } else if (d === "busstop"){
              //console.log(d1[2]);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              console.log(d1);
              const d02=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
              const d01=Array.isArray(d1) && d1.length > 1 ? d1[1] : true;
              console.log(d01);
              const layer=new GeoJsonLayer({
              id: ly,
              data: d02,
              visible:d01,
              stroked: false,
              pointType: "circle", 
              getFillColor: (d)=>[255, 0, 0],
                parameters: {
                  depthTest: false,
                  blend: false,
                },
              getPointRadius:15,
              autoHighlight: hover==="バス停"?true:false,
              getPosition: d => d.coordinates,
              //getText: (d) => d.properties.FIXEDID,
              onClick: (info, event) => {
              try{
                console.log(info.object.properties.name);
                  setClickstop(info.object.properties.name);

              } catch(e){
                console.log(e.message);
              }},
              getLineColor: [0, 0, 0],
              getLineWidth: 10,
              getTextColor: [180, 0, 0],
              textFontWeight: "bold",
              pickable: hover==="バス停"?true:false
            })
            console.log(layer.props.pickable);
            layers_row.push(layer);
            } else if (d === "station"){
              //console.log(d1[2]);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              console.log(d1);
              const d02=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
              const d01=Array.isArray(d1) && d1.length > 1 ? d1[1] : true;
              console.log(d01);
              const layer=new GeoJsonLayer({
              id: ly,
              data: d02,
              visible:d01,
              stroked: false,
              pointType: "circle", 
              getFillColor: (d)=>[255, 0, 0],
                parameters: {
                  depthTest: false,
                  blend: false,
                },
              getPointRadius:15,
              autoHighlight: hover==="バス停"?true:false,
              getPosition: d => d.coordinates,
              //getText: (d) => d.properties.FIXEDID,
              onClick: (info, event) => {
              try{
                console.log(info.object.properties.name);
                  setClickstop(info.object.properties.name);

              } catch(e){
                console.log(e.message);
              }},
              getLineColor: [0, 0, 0],
              getLineWidth: 10,
              getTextColor: [180, 0, 0],
              textFontWeight: "bold",
              pickable: hover==="バス停"?true:false
            })
            console.log(layer.props.pickable);
            layers_row.push(layer);
            } else if (d === "area") {
              console.log(d1);
              const l1 =d1.hasOwnProperty(d)?d1[d]:d1[0];
              if (l1==="chiku"){
                //console.log(d1[2]);
                const l =d1.hasOwnProperty(d)?d1[d][2].features.length:d1[2].features.length;
                //console.log(l);
                for (let i1=0;i1<l;i1++){
                  color_l.push([d1.hasOwnProperty(d)?d1[d][2].features[i1].properties.市区町村:d1[2].features[i1].properties.市区町村,vividColors[i1*2].rgba])
                }
                //console.log(color_l);
                ///Setcolor(data);
                ////console.log(e.features.filter((x)=>x.geometry.type=="Polygon"));

                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
                console.log(d1);
                const layer=new GeoJsonLayer({
                id: ly,
                data: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                visible:Array.isArray(d1) && d1.length > 1 ? d1[1] : true,
                  //getFillColor: (d)=>[255-Math.floor(255*d.properties.index/l), 0,Math.floor(255*d.properties.index/l), 150],
                  getFillColor: [95, 158, 160, 1],
                  getLineWidth:70,
                  getText:(d)=>color_l[d.properties.index][0],
                  getTextSize: 12,
                  getLineColor:[0,0,0],
                  pickable: hover==="地区"?true:false,
                  highlightColor: [255, 0, 255, 100],
                  // Callback when the pointer enters or leaves an object
                  // Callback when the pointer clicks on an object
                  //onClick: (info, event) => //console.log('Clicked:', info, event)
                })
                layers_row.push(layer);
              } else if (l1 === "administrative") {
                //console.log(d1[1]);
                
                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
                console.log(d1);
                const layer=new GeoJsonLayer({
                id: ly,
                data: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                visible:Array.isArray(d1) && d1.length > 1 ? d1[1] : true,
                  getFillColor: (d)=>[95, 158, 160, 1],
                  getLineWidth:50,
                  pickable: hover==="行政区域"?true:false,
                  // Callback when the pointer enters or leaves an object
                  // Callback when the pointer clicks on an object
                  //onClick: (info, event) => //console.log('Clicked:', info, event)
                })
                layers_row.push(layer);
              } else if (l1 === "chochomoku") {

                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
                console.log(d1);
                const layer=new GeoJsonLayer({
                id: ly,
                data: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                visible:Array.isArray(d1) && d1.length > 1 ? d1[1] : true,
                  getText:(d)=>d.properties.HCODE,
                  getFillColor: (d)=>[255,0,0, 0],
                  getLineWidth:5,
                  autoHighlight: hover==="住所"?true:false,
                  highlightColor: [255, 0, 255, 100],
                  pickable: hover==="住所"?true:false,
                  // Callback when the pointer enters or leaves an object
                  onClick: (info, event) => {
                    try{
                      setClickedareaaddress(info.object.properties.S_NAME);
                      setClickedareapop(info.object.properties.JINKO+"人");
                      setClickedareahousehold(info.object.properties.SETAI+"世帯");
                      setClickedareapopdensity(parseInt(info.object.properties.JINKO/(info.object.properties.AREA/100000))+"人/k㎡");
                      setAddress(info.object.properties.S_NAME);
                    } catch(e){
                      console.log(info.object.properties.JINKO);
                      
                    }
                    
                  },
                  // Callback when the pointer clicks on an object
                  //onClick: (info, event) => //console.log('Clicked:', info, event)
                })
                layers_row.push(layer);
              } else if (d1 === "shochiiki") {
                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
                console.log(d1);
                const layer=new GeoJsonLayer({
                id: ly,
                data: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                visible:Array.isArray(d1) && d1.length > 1 ? d1[1] : true,
                  stroked: true,
                  filled: false,
                  getLineWidth:70,
                  getTextSize: 12,
                  getLineColor:[0,0,0],
                  pickable: hover===d1?true:false,
                  highlightColor: [255, 0, 255, 100],
                  // Callback when the pointer enters or leaves an object
                  // Callback when the pointer clicks on an object
                  //onClick: (info, event) => //console.log('Clicked:', info, event)
                })
                layers_row.push(layer);
              } else {
                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
                console.log(d1);
                const layer=new GeoJsonLayer({
                id: ly,
                data: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                visible:Array.isArray(d1) && d1.length > 1 ? d1[1] : true,
                  stroked: true,
                  filled: false,
                  getLineWidth:10,
                  getTextSize: 12,
                  getLineColor:[0,0,0],
                  pickable: hover===d1?true:false,
                  highlightColor: [255, 0, 255, 100],
                  // Callback when the pointer enters or leaves an object
                  // Callback when the pointer clicks on an object
                  //onClick: (info, event) => //console.log('Clicked:', info, event)
                })
                layers_row.push(layer);
              }
            }
          }
        i+=1;
      }
    }
    console.log("🎬 layers_row count:", layers_row.length, "railline layers:", layers_row.filter(l => l.id && l.id.includes('railline')).length);
    return layers_row;
  }, [data,kind,hover,address,area,layercheck,pop,dimention]);
  // 追加：layers_row が更新されたことを確認
  useEffect(() => {
    console.log("🎬 layers_row count: ? railline layers: ?");
  }, [layers]);
  const handleViewStateChange = ({ viewState }) => {
    // 地図が移動した時の処理（ログ出力や状態更新）
    setViewState(viewState);
  };
  let latlon=[];
  let layers0=[...layers,ridingtimerow]
  return (
    <div>
      <div>
        
        <p>{address}</p>
      </div>
      <div>
        <DeckGL
          initialViewState={viewAccessibility}
          controller={true}
          pickable={edit}
          onClick={(info)=>{
            console.log(edit);
            setSelected(prev => {
              const next = true;
            latlon.push([info.coordinate[0],info.coordinate[1]]);
            console.log(latlon.length);
            if(latlon.length>1){EditLine(latlon)}
            return next
            })
          }}
          layers={layers0}
            onViewStateChange={({ viewState }) => {
            setviewAccessibility(viewState);
          }}
        >
          <Map reuseMaps mapboxAccessToken={mapboxAccessToken} mapStyle={mapstyle}/>
        </DeckGL>
      </div>
    </div>
  );
};
export default AreaLayers;