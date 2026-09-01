import { useContext, useMemo,useState,useRef,useEffect,ClickareaCount,useCallback} from 'react';

import EditLine from './EditLine';
import { INITIAL_VIEW_STATE, mapboxAccessToken, mapstyle,initialCheck,vividColors } from "./Globalvariable";
import {useHoverStore,useLegendStore,useEditStore,useAreaStore,useViewAccesibilityStore,useLayercheckStore,useClickmeshStore,useDestStore,useWeekdayStore,useKindStore,useFareStore,useClickareaStore,useTimesliderStore,useGetboundaryStore,useClicklanduseStore,useClickplanningareaStore,useDataStore,useColorareaStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestraillineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore} from "./useStore";
const SetLayers = () => {
  let popmeshkey=[];
  const layers = useMemo(() => {
      if (!data) return [];
      const layers_row = [];
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
    let meshpop;
    //console.log(data);
    for (let d in data){
      // 例: check配列の中にこのレイヤー名が含まれているか確認
      // 都市計画では「表示/非表示」の切り替えが頻繁なのでここで制御
      //const isVisible = check.includes(d.property.name); 
      //console.log(d);
      if (data[d].length>0){
          //console.log(data[d]);
          for (const d1 of data[d]){
            i+=1;
            console.log(d);
            if (d === "facility"){
                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
                console.log(d1);
                const d02=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
                const d01=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
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
                visible:d1.hasOwnProperty(d)?d1[d][1]:d1[1],
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
              const isLayer = layercheck === "複数レイヤー表示";
              const data1=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
              console.log(d1);
              const data1r=data1.features.filter((e)=>{return bounds[0]<=e.geometry.coordinates[0][0][0]&&e.geometry.coordinates[0][2][0]<=bounds[2]&&bounds[1]<=e.geometry.coordinates[0][0][1]&&e.geometry.coordinates[0][2][1]<=bounds[3]});
              //[西経, 南緯, 東経, 北緯]  [minLng, minLat, maxLng, maxLat]
              console.log(data1r.length);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
              const Area =area;
              const layer=new GeoJsonLayer({
              id: ly,
              data: data1r,
              visible:d1.hasOwnProperty(d)?d1[d][1]:d1[1],
              stroked: true,
              filled: false,
              autoHighlight: hover==="居住地"?true:false,
              parameters: {
                depthTest: false,
                blend: false,
              },
              getLineColor: (d,)=>[95, 158, 160, 100],
              getLineWidth:25,
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
              const data1r=data1.features.filter((e)=>{return bounds[0]<=e.geometry.coordinates[0][0][0]&&e.geometry.coordinates[0][2][0]<=bounds[2]&&bounds[1]<=e.geometry.coordinates[0][0][1]&&e.geometry.coordinates[0][2][1]<=bounds[3]});
              //[西経, 南緯, 東経, 北緯]  [minLng, minLat, maxLng, maxLat]
              console.log(data1r.length);
              let datav=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
                
              const layer=new GeoJsonLayer({
                id: ly,
                data: data1r,
                visible:!isLayer?false:datav,
                getFillColor: (d,)=>[1, 0, 102, 50],
                getLineColor: (d,)=>[0,0,0, 0],
                getLineWidth:15,
                stroked: false,
                pickable: hover==="最寄バス停"?true:false,
                autoHighlight: hover==="最寄バス停"?true:false,
                parameters: {
                  depthTest: false,
                  blend: false,
                },
                filled:!isLayer?true:false,
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
            } else if (d === "frequency_on_routes") {
              const Area =area;
              //console.log(d1[2]);
              let s = `JR西条駅_${weekday}_${Math.round(time*100000000)+5}_frequency_direct`;
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              const data1=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
              const data1r=data1.features.filter((e)=>{return bounds[0]<=e.geometry.coordinates[0][0][0]||e.geometry.coordinates[0][2][0]<=bounds[2]||bounds[1]<=e.geometry.coordinates[0][0][1]||e.geometry.coordinates[0][2][1]<=bounds[3]});
              //[西経, 南緯, 東経, 北緯]  [minLng, minLat, maxLng, maxLat]
              console.log(data1r.length);
              const layer=new GeoJsonLayer({
                id: ly,
                data: data1r,
                visible:kind=="運行本数"&&layercheck=="タイムスライダー"?true:d1.hasOwnProperty(d)?d1[d][1]:d1[1],
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
            } else if (d === "ridingtime_direct") {
              const Area =area;
              let num=parseInt(Math.round(time*100000000)+10);
              let s = `${dest}_${weekday}_${num}_ridingtime_direct`;
              let s0 = `${dest}_${weekday}_${num}_rideontime_direct`;
              let s1 = `${dest}_${weekday}_${num}_getofftime_direct`;
              let stop = `${dest}_${weekday}_${num}_rideonstop_direct`;
              let route = `${dest}_${weekday}_${num}_route_direct`;
              console.log(layercheck);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
              let data1=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
              const data1r=data1.features.filter((e)=>{if(e.geometry.type=="Polygon") return bounds[0]<=e.geometry.coordinates[0][0][0]||e.geometry.coordinates[0][2][0]<=bounds[2]||bounds[1]<=e.geometry.coordinates[0][0][1]||e.geometry.coordinates[0][2][1]<=bounds[3]});
              //[西経, 南緯, 東経, 北緯]  [minLng, minLat, maxLng, maxLat]

              let datav=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
              const isLayer = layercheck === "複数レイヤー表示"?true:false;
              const isActive = kind === "所要時間" && layercheck === "タイムスライダー"?true:isLayer;
              console.log(isLayer,isActive,data1);
              let ratiolist=[];
              let valuelist=[];
              const layer=new GeoJsonLayer({
                id: ly,
                data: data1r,
                visible:isActive,
                stroked: false,
                filled: (mesh) => mesh.properties[s] != null,
                getFillColor: (d)=>{
                  const hasValue = d.properties[s] != null

                  const ratio = Math.min(parseInt(d.properties[s]) / 3600, 1)

                  // 複数表示は濃い赤
                  if (isLayer) return [230, 0, 0, 200]
                  // 条件外は完全透明
                  if (!isActive) return [0, 0, 0, 0]

                  // 値がない場合も透明
                  if (!hasValue) return [0, 0, 0, 0]
                    // 濃い赤 [180,0,0] → 薄い赤 [255,200,200]
                  const r = Math.floor(180 + ratio * 75)   // 180 → 255
                  const g = Math.floor(ratio * 200)        // 0 → 200
                  const b = Math.floor(ratio * 200)        // 0 → 200
                  ratiolist.push([[r, g, b, 200],parseInt(parseInt(d.properties[s])/ 60)]);
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
                  setClicknearestbusline(info.object.properties[route]);
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
              const data1p=data1.features.filter((e)=>e.geometry.type=="Point")
              console.log(data1p);
              const ly1=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i+5}`;
              const layerpoint=new IconLayer({
                id: ly1,
                getColor: d => [1, 0, 102],
                getIcon: d => 'marker',
                data: data1p,
                visible:isActive?true:datav,
                getPosition: d => d.geometry.coordinates,
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
              console.log(data1p);
              const ly2=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i*5+100}`;
              const layertextpoint=new TextLayer({
                id: ly2,
                data: data1p,
                visible:isActive?true:datav,
                getPosition: d => d.geometry.coordinates,
                getText: d => d.properties.name,
                characterSet: [...new Set(data1p.map(d => d.properties.name).join(''))],

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

            } else if (d === "ridingtime_transit") {
              const Area =area;
              let num=parseInt(Math.round(time*100000000)+10);
              let sbefore = `${dest}_${weekday}_${num}_ridingtime_beforetranstit`;
              let s0before = `${dest}_${weekday}_${num}_rideontime_beforetranstit`;
              let s1before = `${dest}_${weekday}_${num}_getofftime_beforetranstit`;
              let stopbefore = `${dest}_${weekday}_${num}_rideonstop_beforetranstit`;
              let routebefore  = `${dest}_${weekday}_${num}_route_beforetranstit`;
              let safter = `${dest}_${weekday}_${num}_ridingtime_aftertranstit`;
              let s0after = `${dest}_${weekday}_${num}_rideontime_aftertranstit`;
              let s1after = `${dest}_${weekday}_${num}_getofftime_aftertranstit`;
              let stopafter = `${dest}_${weekday}_${num}_rideonstop_aftertranstit`;
              let routeafter = `${dest}_${weekday}_${num}_route_aftertranstit`;
              console.log(layercheck);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
              let data1=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
              const data1r=data1.features.filter((e)=>{if(e.geometry.type=="Polygon") return bounds[0]<=e.geometry.coordinates[0][0][0]||e.geometry.coordinates[0][2][0]<=bounds[2]||bounds[1]<=e.geometry.coordinates[0][0][1]||e.geometry.coordinates[0][2][1]<=bounds[3]});
              //[西経, 南緯, 東経, 北緯]  [minLng, minLat, maxLng, maxLat]

              let datav=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
              const isLayer = layercheck === "複数レイヤー表示"?true:false;
              const isActive = kind === "所要時間" && layercheck === "タイムスライダー"?true:isLayer;
              console.log(isLayer,isActive,data1);
              let ratiolist=[];
              let valuelist=[];
              const layer=new GeoJsonLayer({
                id: ly,
                data: data1r,
                visible:isActive,
                stroked: false,
                filled: (mesh) => mesh.properties[sbefore] != null,
                getFillColor: (d)=>{
                  const hasValuebefore = d.properties[sbefore] != null

                  const ratiobefore = Math.min(parseInt(d.properties[sbefore]) / 3600, 1)

                  // 複数表示は濃い赤
                  if (isLayer) return [255, 255, 255, 200]
                  // 条件外は完全透明
                  if (!isActive) return [0, 0, 0, 0]

                  // 値がない場合も透明
                  if (!hasValuebefore) return [0, 0, 0, 0]
                    // 濃い赤 [180,0,0] → 薄い赤 [255,200,200]
                  const rbefore = Math.floor(180 + ratiobefore * 75)   // 180 → 255
                  const gbefore = Math.floor(ratiobefore * 200)        // 0 → 200
                  const bbefore = Math.floor(ratiobefore * 200)        // 0 → 200
                  ratiolist.push([[rbefore, gbefore, bbefore, 200],parseInt(parseInt(d.properties[sbefore])/ 60)]);
                  isActive?setLegends(ratiolist):null;
                  return [rbefore, gbefore, bbefore, 200]
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
                  setClicknearestbusline(info.object.properties[route]);
                  console.log('Clicked:',info.object.properties[Area]);
                  setClickpopmeshaddress(info.object.properties[Area]);


                  } catch(e){
                    console.log(e.message);
                  }
                },
                updateTriggers: {
                  filled: [sbefore,safter],
                  getFillColor: [kind, layercheck, sbefore,safter],
                },
                // Callback when the pointer clicks on an object
                //onClick: (info, event) => //console.log('Clicked:', info, event)
              })
              layers_row.push(layer);
              const data1p=data1.features.filter((e)=>e.geometry.type=="Point")
              console.log(data1p);
              const ly1=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i+5}`;
              const layerpoint=new IconLayer({
                id: ly1,
                getColor: d => [1, 0, 102],
                getIcon: d => 'marker',
                data: data1p,
                visible:isActive?true:datav,
                getPosition: d => d.geometry.coordinates,
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
              console.log(data1p);
              const ly2=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i*5+100}`;
              const layertextpoint=new TextLayer({
                id: ly2,
                data: data1p,
                visible:isActive?true:datav,
                getPosition: d => d.geometry.coordinates,
                getText: d => d.properties.name,
                characterSet: [...new Set(data1p.map(d => d.properties.name).join(''))],

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
              let num=parseInt(Math.round(time*100000000)+11);
              let s = `${dest}_${weekday}_${num}_getofffare_direct`;
              //console.log(dest,weekday,Math.round(time*100000000)+5);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              console.log(kind);
              let datav=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
              const isLayer = layercheck === "複数レイヤー表示";
              const isActive = kind === "運賃" && layercheck === "タイムスライダー"?true:false;
              let data1=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
              const data1r=data1.features.filter((e)=>{return bounds[0]<=e.geometry.coordinates[0][0][0]||e.geometry.coordinates[0][2][0]<=bounds[2]||bounds[1]<=e.geometry.coordinates[0][0][1]||e.geometry.coordinates[0][2][1]<=bounds[3]});
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
                visible:d1.hasOwnProperty(d)?d1[d][1]:d1[1],
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
              layers_row.push(layer);
            
            } else if (d === "busline") {
              let colorl=[];
              console.log(d1);
              let d1r=d1.hasOwnProperty(d)?d1[d]:d1;
              let d1r2;
              try{
                console.log(d1r[2]);
                d1r2=d1r[2];
                for (const d2 of d1r[2].features){
                  colorl.push(d2.properties.lnno);
                }

              } catch{
                console.log(d1r[0][2]);
                d1r2=d1r[0][2];
                for (const d2 of d1r[0][2].features){
                  colorl.push(d2.properties.lnno);
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
              getFillColor: (d)=>[255, 0, 0],
              getLineColor: (d)=>[Math.floor(Math.random() * 255), 255-Math.floor(Math.random() * 255), 10],
              getLineWidth:15,
              getText:(d)=>d.properties.lnno,
              getTextAlignmentBaseline:"center",
                parameters: {
                  depthTest: false,
                  blend: false,
                },
              pickable: hover==="バス路線"?true:false,
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
              const d01=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
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
                visible:d1.hasOwnProperty(d)?d1[d][1]:d1[1],
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
                visible:d1.hasOwnProperty(d)?d1[d][1]:d1[1],
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
                visible:d1.hasOwnProperty(d)?d1[d][1]:d1[1],
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
                visible:d1.hasOwnProperty(d)?d1[d][1]:d1[1],
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
              }
            }
          }
        }
        i+=1;
    }
    //console.log(layers_row.length);
    return layers_row;
  }, [data,flag,time,dest,weekday,kind,hover,address,area,layercheck,viewAccessibility,bounds]);
  const handleViewStateChange = ({ viewState }) => {
    // 地図が移動した時の処理（ログ出力や状態更新）
    setViewState(viewState);
  };
}
          //<Map reuseMaps mapboxAccessToken={mapboxAccessToken} mapStyle={mapstyle}/>
export default SetLayers;