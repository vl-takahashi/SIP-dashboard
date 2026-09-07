import { useMemo, useState, useRef, useEffect } from 'react';
import React from 'react';
import Map from 'react-map-gl/mapbox';

import {  mapboxAccessToken, mapstyle, osmTileUrl, initialCheck, vividColors } from "./Globalvariable";
import {useHoverStore,useViewDemandStore,useAreaStore,useLayercheckStore,useClickmeshStore,useDestStore,useWeekdayStore,useKindStore,useFareStore,useClickareaStore,useTimesliderStore,useGetboundaryStore,useClicklanduseStore,useClickplanningareaStore,useDataStore,useColorareaStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestraillineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore} from "./useStore";
import { useQuestionsStore } from "./useQuestionsStore";
const UpdateLayers = () => {
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

  // Q1/Q2/Q3 データを取得
  const questions = useQuestionsStore((state) => state.questions);
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
      // Note: Mapbox background layer is handled by mapStyle
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
                const layer={
                  id: ly,
                  type: 'circle',
                  sourceData: d02,
                  paint: {
                    'circle-radius': 5,
                    'circle-color': '#ff0000',
                    'circle-opacity': 0.8
                  },
                  layout: {},
                  visible: d01,
                  hoverType: "施設",
                  clickHandler: (feature) => {
                    try{
                      setClickstop(feature.properties.name);
                    } catch(e){
                      //console.log(e.message);
                    }
                  }
                };
              layers_row.push(layer);

            } else if (d === "road") {
              //console.log(d1[2]);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
              console.log(d1);
              const layer={
                id: ly,
                type: 'line',
                sourceData: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                paint: {
                  'line-color': '#ff0000',
                  'line-width': 2
                },
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                visible: d1.hasOwnProperty(d)?d1[d][1]:d1[1],
                hoverType: "道路",
                clickHandler: (feature) => {
                  try{
                    setClicknearestbusline(feature.properties.name.replace(/[^0-9]/g, ''));
                  } catch(e){
                  }
                }
              };
              layers_row.push(layer);
            } else if (d === "popmesh") {
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
              const Area =area;
              const layer={
                id: ly,
                type: 'line',
                sourceData: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                paint: {
                  'line-color': '#5f9ea0',
                  'line-width': 2
                },
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                visible: d1.hasOwnProperty(d)?d1[d][1]:d1[1],
                hoverType: "居住地",
                clickHandler: (feature) => {
                  try{
                    console.log(feature.properties.PT00_2025);
                    setClickpopmesh(parseInt(feature.properties.PT00_2025));
                    console.log(feature.properties[Area]);
                    setClickpopmeshaddress(feature.properties[Area]);
                  } catch(e){
                    console.log(e.message);
                  }
                }
              };
              layers_row.push(layer);

            } else if (d === "od_visual"){
                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d][0]}-${i}`:`layer-${d}-${d1[0]}-${i}`;
                console.log(d1);
                const d02=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
                const d01=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
                const layer={
                  id: ly,
                  type: 'line',
                  sourceData: d02,
                  paint: {
                    'line-color': '#ff0000',
                    'line-width': [
                      'case',
                      ['<', ['get', 'count'], 10],
                      10,
                      ['+', ['/', ['get', 'count'], 10], 10]
                    ]
                  },
                  layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                  },
                  visible: d01,
                  hoverType: "od_visual",
                  clickHandler: (feature) => {}
                };
              layers_row.push(layer);

            } else if (d === "spatialbuffer") {
              const Area =area;
              //console.log(d1[2]);
              //popmeshkey=[[key,data]]
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              const layer={
                id: ly,
                type: 'fill',
                sourceData: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                paint: {
                  'fill-color': '#010066',
                  'fill-opacity': 0.2
                },
                layout: {},
                visible: d1.hasOwnProperty(d)?d1[d][1]:d1[1],
                hoverType: "最寄バス停",
                clickHandler: (feature) => {
                  try{
                    setClickneareststop(feature.properties.stop_name);
                    setClickpopmeshaddress(feature.properties[Area]);
                  } catch(e){
                    console.log(e.message);
                  }
                }
              };
              layers_row.push(layer);
            } else if (d === "frequency") {
              const Area =area;
              //console.log(d1[2]);
              let s = `JR西条駅_${weekday}_${Math.round(time*100000000)+5}_frequency_direct`;
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              const layer={
                id: ly,
                type: 'fill',
                sourceData: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
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
                visible: kind=="運行本数"&&layercheck=="タイムスライダー"?true:d1.hasOwnProperty(d)?d1[d][1]:d1[1],
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
              console.log(layer);
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
              const layer={
                id: ly,
                type: 'fill',
                sourceData: data1,
                paint: {
                  'fill-color': [
                    'case',
                    ['!=', ['get', s], null],
                    [
                      'rgb',
                      ['max', 0, ['min', 255, ['floor', ['-', 255, ['*', ['min', 1, ['/', ['to-number', ['get', s]], 3600]], 75]]]]],
                      ['max', 0, ['min', 200, ['floor', ['*', ['-', 1, ['min', 1, ['/', ['to-number', ['get', s]], 3600]]], 200]]]],
                      ['max', 0, ['min', 200, ['floor', ['*', ['-', 1, ['min', 1, ['/', ['to-number', ['get', s]], 3600]]], 200]]]]
                    ],
                    'rgba(0, 0, 0, 0)'
                  ],
                  'fill-opacity': ['case', ['!=', ['get', s], null], 1, 0]
                },
                layout: {},
                visible: kind=="所要時間"||layercheck=="タイムスライダー"&&d1.hasOwnProperty(d)?true:datav,
                hoverType: "所要時間",
                clickHandler: (feature) => {
                  try{
                    console.log('Clicked:', feature.properties[s0]);
                    setClicknearestridetime(feature.properties[s0]);
                    setClicknearestgetofftime(feature.properties[s1]);
                    setClickneareststop(feature.properties[stop]);
                    setClicknearestbusline(feature.properties[route]);
                    console.log('Clicked:', feature.properties[Area]);
                    setClickpopmeshaddress(feature.properties[Area]);
                  } catch(e){
                    console.log(e.message);
                  }
                }
              };
              console.log(layer);
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
              const layer={
                id: ly,
                type: 'fill',
                sourceData: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                paint: {
                  'fill-color': [
                    'case',
                    ['!=', ['get', s], null],
                    [
                      'rgb',
                      ['max', 0, ['min', 200, ['floor', ['*', ['-', 1, ['min', 1, ['/', ['to-number', ['get', s]], 3000]]], 200]]]],
                      ['max', 0, ['min', 255, ['floor', ['-', 255, ['*', ['min', 1, ['/', ['to-number', ['get', s]], 3000]], 75]]]]],
                      ['max', 0, ['min', 200, ['floor', ['*', ['-', 1, ['min', 1, ['/', ['to-number', ['get', s]], 3000]]], 200]]]]
                    ],
                    'rgba(0, 0, 0, 0)'
                  ],
                  'fill-opacity': ['case', ['!=', ['get', s], null], 1, 0]
                },
                layout: {},
                visible: kind=="運賃"&&layercheck=="タイムスライダー"?true:d1.hasOwnProperty(d)?d1[d][1]:datav,
                hoverType: "運賃",
                clickHandler: (feature) => {
                  try{
                    setFare(feature.s);
                  } catch(e){
                    //console.log(e.message);
                  }
                }
              };
              layers_row.push(layer);

            } else if (d === "gmal"){
              console.log(d1);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;

              const layer={
                id: ly,
                type: 'fill',
                sourceData: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                paint: {
                  'fill-color': [
                    'case',
                    ['>', ['get', 'totalAI'], 1],
                    ['rgb', 0, ['*', ['to-number', ['get', 'totalAI']], 35], ['*', ['to-number', ['get', 'totalAI']], 35]],
                    '#00ff00'
                  ],
                  'fill-opacity': ['case', ['>', ['get', 'totalAI'], 0], 0.6, 0]
                },
                layout: {},
                visible: d1.hasOwnProperty(d)?d1[d][1]:d1[1],
                hoverType: "lipt",
                clickHandler: (feature) => {
                  try{
                  } catch(e){
                  }
                }
              };
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
              const layer={
                id: ly,
                type: 'line',
                sourceData: l,
                paint: {
                  'line-color': '#ff0000',
                  'line-width': 2
                },
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                visible: true,
                hoverType: "バス路線",
                clickHandler: (feature) => {
                  try{
                    setClicknearestbusline(feature.properties.name.replace(/[^0-9]/g, ''));
                  } catch(e){
                  }
                }
              };
              layers_row.push(layer);
            } else if (d === "busstop"){
              //console.log(d1[2]);
              const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
              console.log(d1);
              const d02=d1.hasOwnProperty(d)?d1[d][2]:d1[2];
              const d01=d1.hasOwnProperty(d)?d1[d][1]:d1[1];
              const layer={
                id: ly,
                type: 'circle',
                sourceData: d02,
                paint: {
                  'circle-radius': 5,
                  'circle-color': '#005587',
                  'circle-opacity': 0.8
                },
                layout: {},
                visible: d01,
                hoverType: "バス停",
                clickHandler: (feature) => {
                  try{
                    console.log(feature.properties.name);
                    setClickstop(feature.properties.name);
                  } catch(e){
                    console.log(e.message);
                  }
                }
              };
              console.log(layer);
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

                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
                console.log(d1);
                const layer={
                  id: ly,
                  type: 'fill',
                  sourceData: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                  paint: {
                    'fill-color': '#5fa8a0',
                    'fill-opacity': 0.3
                  },
                  layout: {},
                  visible: d1.hasOwnProperty(d)?d1[d][1]:d1[1],
                  hoverType: "地区",
                  clickHandler: (feature) => {
                    try{
                    } catch(e){
                    }
                  }
                };
                layers_row.push(layer);
              } else if (l1 === "administrative") {

                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
                console.log(d1);
                const layer={
                  id: ly,
                  type: 'fill',
                  sourceData: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                  paint: {
                    'fill-color': '#5fa8a0',
                    'fill-opacity': 0.2
                  },
                  layout: {},
                  visible: d1.hasOwnProperty(d)?d1[d][1]:d1[1],
                  hoverType: "行政区域",
                  clickHandler: (feature) => {
                    try{
                    } catch(e){
                    }
                  }
                };
                layers_row.push(layer);
              } else if (l1 === "chochomoku") {

                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
                console.log(d1);
                const layer={
                  id: ly,
                  type: 'line',
                  sourceData: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                  paint: {
                    'line-color': '#000000',
                    'line-width': 1
                  },
                  layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                  },
                  visible: d1.hasOwnProperty(d)?d1[d][1]:d1[1],
                  hoverType: "住所",
                  clickHandler: (feature) => {
                    try{
                      setClickedareaaddress(feature.properties.S_NAME);
                      setClickedareapop(feature.properties.JINKO+"人");
                      setClickedareahousehold(feature.properties.SETAI+"世帯");
                      setClickedareapopdensity(parseInt(feature.properties.JINKO/(feature.properties.AREA/100000))+"人/k㎡");
                      setAddress(feature.properties.S_NAME);
                    } catch(e){
                      console.log(feature.properties.JINKO);
                    }
                  }
                };
                layers_row.push(layer);
              } else if (d1 === "shochiiki") {
                const ly=d1.hasOwnProperty(d)?`layer-${d}-${d1[d]}-${i}`:`layer-${d}-${d1}-${i}`;
                console.log(d1);
                const layer={
                  id: ly,
                  type: 'line',
                  sourceData: d1.hasOwnProperty(d)?d1[d][2]:d1[2],
                  paint: {
                    'line-color': '#000000',
                    'line-width': 2
                  },
                  layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                  },
                  visible: d1.hasOwnProperty(d)?d1[d][1]:d1[1],
                  hoverType: d1,
                  clickHandler: (feature) => {
                    try{
                    } catch(e){
                    }
                  }
                };
                layers_row.push(layer);
              }
            }
          }
        }
        i+=1;
    }

    // Q1/Q2/Q3 データからポイントレイヤーを生成
    if (questions &&
        questions.q1_destination &&
        questions.q1_destination === dest &&
        questions.q2_latitude &&
        questions.q2_longitude) {

      const q3_hour = Math.round(time * 100000000) + 11;

      // Q3の到着時間が一致した時だけ表示
      const isQ3Match = questions.q3_arrival_time === q3_hour;

      console.log(`🏘️  住民データ: 目的地=${questions.q1_destination}, Q3時間=${questions.q3_arrival_time}, スライダー時間=${q3_hour}, 一致=${isQ3Match}`);

      const residentPointLayer = {
        id: 'resident-point-layer',
        type: 'circle',
        sourceData: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [questions.q2_longitude, questions.q2_latitude]
            },
            properties: {
              address: questions.address,
              q1_destination: questions.q1_destination,
              q3_arrival_time: questions.q3_arrival_time
            }
          }]
        },
        paint: {
          'circle-radius': 10,
          'circle-color': '#0000ff', // 青固定
          'circle-opacity': 0.9,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        },
        layout: {},
        visible: isQ3Match, // Q3一致時だけ表示
        hoverType: 'resident',
        clickHandler: (feature) => {
          console.log('🏘️  住民の位置をクリック:', feature.properties);
        }
      };

      layers_row.push(residentPointLayer);
    }

    //console.log(layers_row.length);
    return layers_row;
  }, [data,flag,time,dest,weekday,kind,hover,address,area,layercheck,questions]);
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
    const allLayers = [...meshLayers, ...pointLayers];

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
  }, [layers, hover]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
        <p>{address}</p>
      </div>
      <Map
        ref={mapRef}
        initialViewState={viewDemand}
        mapboxAccessToken={mapboxAccessToken}
        mapStyle={mapstyle}
        onMove={({ viewState }) => setviewDemand(viewState)}
      />
    </div>
  );
};
export default UpdateLayers;
