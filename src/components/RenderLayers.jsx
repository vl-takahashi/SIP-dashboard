import { useContext, useMemo,useState,useRef,useEffect,ClickareaCount,useCallback} from 'react';

import {  mapboxAccessToken, mapstyle,initialCheck,vividColors } from "./Globalvariable";
import {useHoverStore,useAreaStore,useLayercheckStore,useClickmeshStore,useDestStore,useWeekdayStore,useKindStore,useFareStore,useClickareaStore,useTimesliderStore,useGetboundaryStore,useClicklanduseStore,useClickplanningareaStore,useDataStore,useColorareaStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestraillineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore} from "./useStore";
const UpdateLayers = () => {
  const color_l=[];
  const setArea_list = useColorareaStore((state) => state.setColorarea);
  const hover=useHoverStore((state)=>state.select);
  const weekday =useWeekdayStore((state)=>state.select);
  const dest =useDestStore((state)=>state.select);
  const time = useTimesliderStore((state)=>state.time);
  const area = useAreaStore((state)=>state.area);
  const kind = useKindStore((state)=>state.select);
  const data = useDataStore((state) => state.data);
  const flag = useDataStore((state) => state.flag);
  let nw=[132.590317,34.618206];
  let ne=[132.94325324146035,34.61707537902578];
  let sw=[132.56834478273046,34.27392753449381];
  let se=[132.90480109184705,34.292082779796985];
  const [address,setAddress]=useState("None");
  const layercheck=useLayercheckStore((state)=> state.select);
  const setFare = useFareStore((state) => state.setFare);
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
  let popmeshkey=[];
  const layers = useMemo(() => {
    console.log(hover,kind);
      if (!data) return [];
      const layers_row = [];
      const layer = new TileLayer({
    id: 'gsi-tile-layer',
    // 先ほどエラーになった {t} を 'std' に、{ext} を 'png' に固定します
    // deck.gl は {z}, {x}, {y} を自動で解釈してリクエストします
    data: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    
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
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
              const Area =area;
              const layer=new GeoJsonLayer({
              id: ly,
              data: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
              visible:d1.hasOwnProperty(d)?d1[d][1]:d1[1],
              stroked: true,
              filled: false,
              autoHighlight: hover==="居住地"?true:false,
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
              //console.log(d1[2]);
              //popmeshkey=[[key,data]]
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              const layer=new GeoJsonLayer({
                id: ly,
                data: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                visible:d1.hasOwnProperty(d)?d1[d][1]:d1[1],
                getFillColor: (d,)=>[1, 0, 102, 50],
                getLineColor: (d,)=>[0,0,0, 0],
                getLineWidth:15,
                stroked: false,
                pickable: hover==="最寄バス停"?true:false,
                autoHighlight: hover==="最寄バス停"?true:false,
                filled:true,
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
            } else if (d === "frequency") {
              const Area =area;
              //console.log(d1[2]);
              let s = `JR西条駅_${weekday}_${Math.round(time*100000000)+5}_frequency_direct`;
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              const layer=new GeoJsonLayer({
                id: ly,
                data: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                visible:kind=="運行本数"&&layercheck=="タイムスライダー"?true:d1.hasOwnProperty(d)?d1[d][1]:d1[1],
                getFillColor: (d)=>[0,kind=="運行本数"&&layercheck=="タイムスライダー"&&d.properties[s]!=null?153-Math.floor(parseInt(d.properties[s])/5*153):0,kind=="運行本数"&&layercheck=="タイムスライダー"&&d.properties[s]!=null?204-Math.floor(parseInt(d.properties[s])/5*204):0, kind=="運行本数"&&layercheck=="タイムスライダー"&&d.properties[s]!=null?255-Math.floor(parseInt(d.properties[s])/10*255):0,100],
                getLineColor: (d,)=>[0,0,0, 0],
                getLineWidth:15,
                stroked: false,
                pickable: hover==="運行本数"?true:false,
                autoHighlight: hover==="運行本数"?true:false,
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
            } else if (d === "ridingtime") {
              const Area =area;
              let num=parseInt(Math.round(time*100000000)+10);
              let s = `${dest}_${weekday}_${num}_ridingtime_direct`;
              let s0 = `${dest}_${weekday}_${num}_rideontime_direct`;
              let s1 = `${dest}_${weekday}_${num}_getofftime_direct`;
              let stop = `${dest}_${weekday}_${num}_rideonstop_direct`;
              let route = `${dest}_${weekday}_${num}_route_direct`;
              console.log(kind,layercheck);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
              let data1=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
              let datav=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
              const isLayer = layercheck === "複数表示";
              const isActive = kind === "所要時間" && layercheck === "タイムスライダー";
              console.log(isLayer,isActive,s);
              const layer=new GeoJsonLayer({
                id: ly,
                data: data1,
                visible:kind=="所要時間"||layercheck=="タイムスライダー"&&d1.hasOwnProperty(d)?true:datav,
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
                    // 薄い赤 [255,200,200] → 濃い赤 [180,0,0]
                    const r = Math.floor(255 - ratio * 75)   // 255 → 180
                    const g = Math.floor((1 - ratio) * 200)  // 200 → 0
                    const b = Math.floor((1 - ratio) * 200)  // 200 → 0
                  return [r, g, b, 200]
                },
                getLineWidth:15,
                pickable: hover==="所要時間"?true:false,
                autoHighlight: hover==="所要時間"?true:false,
                
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
              console.log(layer.props.getFillColor);
              layers_row.push(layer);

            } else if (d === "fare") {
              let num=parseInt(Math.round(time*100000000)+11);
              let s = `${dest}_${weekday}_${num}_getofffare_direct`;
              //console.log(dest,weekday,Math.round(time*100000000)+5);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              console.log(kind);
              let datav=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
              const isLayer = layercheck === "複数表示";
              const isActive = kind === "所要時間" && layercheck === "タイムスライダー";
              console.log(isLayer,isActive,s);
              const layer=new GeoJsonLayer({
                id: ly,
                data: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                visible:kind=="運賃"&&layercheck=="タイムスライダー"?true:d1.hasOwnProperty(d)?d1[d][1]:datav,
                stroked: false,
                filled: true,
                autoHighlight: hover==="運賃"?true:false,
                getFillColor: (d)=>{
                  const hasValue = d.properties[s] != null

                  const ratio = Math.min(parseInt(d.properties[s]) / 3000, 1)

                  // 複数表示は濃い赤
                  if (isLayer) return [230, 0, 0, 200]
                  // 条件外は完全透明
                  if (!isActive) return [0, 0, 0, 0]

                  // 値がない場合も透明
                  if (!hasValue) return [0, 0, 0, 0]
                  const r = Math.floor((1 - ratio) * 200)  // 200 → 0
                  const g = Math.floor(255 - ratio * 75)   // 255 → 180
                  const b = Math.floor((1 - ratio) * 200)  // 200 → 0
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

            } else if (d === "gmal"){
              console.log(d1);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              
              const layer=new GeoJsonLayer({
                id: ly,
                data: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                visible:d1.hasOwnProperty(d)?d1[d][1]:d1[1],
                stroked: false,
                filled: (d)=>[d.properties.totalAI>0?true:falsee],
                getFillColor: (d)=>[0, d.properties.totalAI>1?parseInt(d.properties.totalAI)*35:0,d.properties.totalAI>1?parseInt(d.properties.totalAI)*35:0, d.properties.totalAI>0?100:0],
                pickable: hover==="lipt"?true:false,
                // Callback when the pointer enters or leaves an object
                // Callback when the pointer clicks on an object
                //onClick: (info, event) => console.log('Clicked:', info.object.properties)
              })
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
                console.log(d1r[0]);
                d1r2=d1r[0];
                for (const d2 of d1r[0][2].features){
                  colorl.push(d2.properties.lnno);
                }

                
              } 
              let newcol= [...new Set(colorl)];

              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              const l =d1r2.hasOwnProperty("features")==1?d1r2:d1r2[2]
              console.log(l);
              const layer=new GeoJsonLayer({
              id: ly,
              data: l,
              visible:true,
              stroked: true,
              filled: true,
              getFillColor: (d)=>[parseInt(newcol.indexOf(d.properties.lnno)), 0, 0],
              getLineColor: (d)=>[Math.floor(Math.random() * 255), 255-Math.floor(Math.random() * 255), 10],
              getLineWidth:15,
              getText:(d)=>d.properties.lnno,
              getTextAlignmentBaseline:"center",
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
              const layer=new GeoJsonLayer({
              id: ly,
              data: d02,
              visible:d01,
              stroked: false,
              pointType: "circle", 
              getPointRadius:5,
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
              getFillColor: [0, 85, 143],
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
  }, [data,flag,time,dest,weekday,kind,hover,address,area,layercheck]);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const handleViewStateChange = ({ viewState }) => {
    // 地図が移動した時の処理（ログ出力や状態更新）
    //console.log('Map moved:', viewState);
    setViewState(viewState);
  };

  return (
    <div>
      <div>
        
        <p>{address}</p>
      </div>
      <div>
        <DeckGL
          initialViewState={viewState}
          controller={true}
          layers={layers}
            onViewStateChange={({ viewState }) => {
            setViewState(viewState);
            // 必要に応じてここでコンソール出力や上位コンポーネントへの渡しが可能
            console.log("Current ViewState:", viewState);
          }}
        >
        </DeckGL>
      </div>
    </div>
  );
};
          //<Map reuseMaps mapboxAccessToken={mapboxAccessToken} mapStyle={mapstyle}/>
export default UpdateLayers;