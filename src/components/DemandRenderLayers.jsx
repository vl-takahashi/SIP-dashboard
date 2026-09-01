import { useContext, useMemo,useState,useRef,useEffect,ClickareaCount,useCallback} from 'react';

import Map from 'react-map-gl/mapbox';

import {mapboxAccessToken, mapstyle,initialCheck,vividColors } from "./Globalvariable";
import {useHoverStore,useViewDemandStore,useAreaStore,useLayercheckStore,useClickmeshStore,useDestStore,useWeekdayStore,useKindStore,useFareStore,useClickareaStore,useTimesliderStore,useGetboundaryStore,useClicklanduseStore,useClickplanningareaStore,useDataStore,useColorareaStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestraillineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore} from "./useStore";
const DemandRenderLayers = () => {
  const color_l=[];
  const setArea_list = useColorareaStore((state) => state.setColorarea);
  const viewDemand=useViewDemandStore((state) => state.select);
  const setviewDemand=useViewDemandStore((state) => state.selectView);
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
            if (d === "od_visual"){
                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
                console.log(d1);
                const d02=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
                const d01=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
                const layer=new GeoJsonLayer({
                id: ly,
                data: d02,
                visible:d01,
                stroked: false,
                getPath: d => d.coordinates,
                getLineColor: [255, 0, 0],
                getLineWidth: d=>d.properties.count<10?10:d.properties.count/10+10,
              })
              layers_row.push(layer);
              
            } else if (d === "odtime_visual") {
                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
                console.log(d1);
                const d02=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
                const d01=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
                const layer=new GeoJsonLayer({
                id: ly,
                data: d02,
                visible:d01,
                stroked: false,
                getPath: d => d.coordinates,
                getLineColor: [0, 0, 0],
                getLineWidth: 10,
              })
              layers_row.push(layer);
            } else if (d === `odtime_dest_mesh`) {
                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
                console.log(d1);
                const d02=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
                const d01=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
                const isLayer = layercheck === "複数レイヤー表示";
                const isActive = kind === "時間帯" && layercheck === "タイムスライダー"?true:false;
                const layer=new GeoJsonLayer({
                id: ly,
                data: d02,
                visible:isActive?true:d01,
                getFillColor: (d)=>{
                  const count = d.properties.dest_hour.reduce((acc, val) => {
                    acc[val] = (acc[val] || 0) + 1;
                    return acc;
                  }, {});
                  if (!isActive){
                  [0, d.properties.dest_hour.length/10*255,d.properties.dest_hour.length/10*255, 200]

                  } else {
                    
                  [0, count[time]/10*255,count[time]/10*255, 200]
                  }},
               
              })
              layers_row.push(layer);
            }
          }
        }
        i+=1;
    }
    //console.log(layers_row.length);
    return layers_row;
  }, [data,flag,time,dest,weekday,kind,hover,address,area,layercheck]);
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
          initialViewState={viewDemand}
          controller={true}
          layers={layers}
            onViewStateChange={({ viewState }) => {
            setviewDemand(viewState);
            // 必要に応じてここでコンソール出力や上位コンポーネントへの渡しが可能
            
          }}
        >
        <Map reuseMaps mapboxAccessToken={mapboxAccessToken} mapStyle={mapstyle}/>
      </DeckGL>
      </div>
    </div>
  );
};
          //<Map reuseMaps mapboxAccessToken={mapboxAccessToken} mapStyle={mapstyle}/>
export default DemandRenderLayers;