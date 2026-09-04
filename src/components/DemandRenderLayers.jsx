import { useContext, useMemo,useState,useRef,useEffect,ClickareaCount,useCallback} from 'react';
import React from 'react';
import Map from 'react-map-gl/mapbox';

import {mapboxAccessToken, mapstyle,initialCheck,vividColors } from "./Globalvariable";
import {useHoverStore,useViewDemandStore,useFlagStore,useDirectStore,useLayerflagStore,usePopStore,usePopmeshStore,useEditStore,useAreaStore,useViewAccesibilityStore,useLayercheckStore,useClickmeshStore,useDestStore,useWeekdayStore,useKindStore,useFareStore,useClickareaStore,useTimesliderStore,useGetboundaryStore,useClicklanduseStore,useClickplanningareaStore,useDataStore,useColorareaStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestraillineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore} from "./useStore";
import { formControlClasses } from '@mui/material';
const DemandRenderLayers = () => {
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
    const mapRef = useRef(null);
  const [address,setAddress]=useState("None");
  const layercheck=useLayercheckStore((state)=> state.select);
    const viewAccessibility=useViewAccesibilityStore((state) => state.select);
  let popmeshkey=[];
    const layers = useMemo(() => {
        if (!data) return [];
        const layers_row = [];
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
                // ★Mapbox GL対応：line layer
                const layer={
                  id: ly,
                  type: 'line',
                  sourceData: d02,
                  paint: {
                    'line-color': 'rgb(255, 0, 0)',
                    'line-width': [
                      'interpolate',
                      ['linear'],
                      ['get', 'count'],
                      10, 2,
                      100, 10
                    ]
                  },
                  layout: {},
                  visible: d01,
                }
              layers_row.push(layer);

            } else if (d === "odtime_visual") {
                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
                console.log(d1);
                const d02=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
                const d01=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
                // ★Mapbox GL対応：line layer
                const layer={
                  id: ly,
                  type: 'line',
                  sourceData: d02,
                  paint: {
                    'line-color': 'rgb(0, 0, 0)',
                    'line-width': 2
                  },
                  layout: {},
                  visible: d01,
                }
              layers_row.push(layer);
            } else if (d === `odtime_dest_mesh`) {
                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
                console.log(d1);
                const d02=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
                const d01=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
                const isLayer = layercheck === "複数レイヤー表示";
                const isActive = kind === "時間帯" && layercheck === "タイムスライダー"?true:false;

                // ★Mapbox GL対応：fill layer
                const layer={
                  id: ly,
                  type: 'fill',
                  sourceData: d02,
                  paint: {
                    'fill-color': isActive
                      ? ['case',
                          ['!=', ['get', 'dest_hour'], null],
                          ['rgb', 0,
                            ['min', 255, ['/', ['*', ['length', ['get', 'dest_hour']], 255], 10]],
                            ['min', 255, ['/', ['*', ['length', ['get', 'dest_hour']], 255], 10]]
                          ],
                          'rgba(0, 0, 0, 0)'
                        ]
                      : ['rgb', 0,
                          ['min', 255, ['/', ['*', ['length', ['get', 'dest_hour']], 255], 10]],
                          ['min', 255, ['/', ['*', ['length', ['get', 'dest_hour']], 255], 10]]
                        ],
                    'fill-opacity': 0.7
                  },
                  layout: {},
                  visible: isActive ? true : d01,
                }
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
          //<Map reuseMaps mapboxAccessToken={mapboxAccessToken} mapStyle={mapstyle}/>
export default DemandRenderLayers;
