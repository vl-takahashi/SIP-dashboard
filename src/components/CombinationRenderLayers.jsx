import { useMemo, useState, useRef, useEffect } from 'react';
import React from 'react';
import Map from 'react-map-gl/mapbox';

import {  mapboxAccessToken, mapstyle, osmTileUrl, initialCheck, vividColors } from "./Globalvariable";
import {useHoverStore,useViewDemandStore,useAreaStore,useQuestionStore,useDestStore,useWeekdayStore,useKindStore,useFareStore,useClickareaStore,useTimesliderStore,useGetboundaryStore,useClicklanduseStore,useClickplanningareaStore,useDataStore,useColorareaStore,useClickstopStore,useClickneareststopStore,useClicknearestbuslineStore,useClicknearestraillineStore,useClicknearestridetimeStore,useClicknearestgetofftimeStore} from "./useStore";
import { useQuestionsStore } from "./useQuestionsStore";
const CombinationLayers = () => {
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

  // ✅ デバッグ用ログ
  console.log('🔍 【CombinationRenderLayers】useQuestionsStore から取得:', {
    q2_latitude: questions.q2_latitude,
    q2_longitude: questions.q2_longitude,
    q1_destination: questions.q1_destination,
  });

  let nw=[132.590317,34.618206];
  let ne=[132.94325324146035,34.61707537902578];
  let sw=[132.56834478273046,34.27392753449381];
  let se=[132.90480109184705,34.292082779796985];
  const [address,setAddress]=useState("None");
  const question =useQuestionStore((state)=> state.question);
  let layers_row=[];
  const layers = useMemo(() => {


      const q3_hour = Math.round(time * 100000000) + 11;

      // Q3の到着時間が一致した時だけ表示
      const isQ3Match = questions.q3_arrival_time === q3_hour;

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
            //properties: {
              //address: questions.address,
              //q1_destination: questions.q1_destination,
              //q3_arrival_time: questions.q3_arrival_time
            //}
          }]
        },
        paint: {
          'circle-radius': 50,
          'circle-color': '#0000ff', // 青固定
          'circle-opacity': 0.9,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff'
        },
        layout: {},
        visible: true,//isQ3Match, // Q3一致時だけ表示
        hoverType: 'resident',
        clickHandler: (feature) => {
          console.log('🏘️  住民の位置をクリック:', feature.properties);
        }

      };

      layers_row.push(residentPointLayer);

    // Q1/Q2/Q3 データからポイントレイヤーを生成
    if (questions &&
        questions.q1_destination &&
        questions.q1_destination === dest &&
        questions.q2_latitude &&
        questions.q2_longitude) {
    }

    //console.log(layers_row.length);
    return layers_row;
  }, [questions, time, dest, question]);
  // Map reference for Mapbox GL JS
  const mapRef = useRef(null);
  const loadedSourcesRef = useRef(new Set());
  const clickHandlersRef = useRef({});

  // ✅ mapRef が設定されたか確認
  useEffect(() => {
    console.log('🗺️ 【componentDidMount】mapRef.current:', mapRef.current);
    console.log('🗺️ 【componentDidMount】mapRef.current?.getMap:', mapRef.current?.getMap);
  }, []);

  // Setup layers in Mapbox GL JS
  useEffect(() => {
    const map = mapRef.current?.getMap?.();

    console.log('🗺️ 【useEffect】mapRef.current:', mapRef.current);
    console.log('🗺️ 【useEffect】map:', map ? 'EXISTS' : 'NULL');
    console.log('🗺️ 【useEffect】isStyleLoaded:', map?.isStyleLoaded?.());

    if (!map || !map.isStyleLoaded()) {
      console.warn('⚠️ 【useEffect】マップまたはスタイルが未読み込み');
      return;
    }

    console.log('📌 【useEffect】layers 配列:', layers);
    console.log('📌 【useEffect】resident-point-layer 含まれているか:', layers.some(l => l.id === 'resident-point-layer'));

    // Separate layers: mesh first, then points on top
    const meshLayers = layers.filter(l => l.type === 'fill' || l.type === 'line');
    const pointLayers = layers.filter(l => l.type === 'symbol' || l.type === 'circle');
    const allLayers = [...meshLayers, ...pointLayers];

    console.log('📌 【useEffect】pointLayers:', pointLayers);

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
  }, [layers, hover,question]);

  // ✅ Map コンポーネントの onLoad コールバック - ここでレイヤーも直接追加
  const handleMapLoad = (mapInstance) => {
    console.log('🗺️ 【handleMapLoad】Map loaded:', mapInstance);

    // mapRef.current に直接マップを設定
    if (mapRef.current) {
      mapRef.current.getMap = () => mapInstance;
      console.log('🗺️ 【handleMapLoad】getMap設定完了');
    }

    // ✅ ここで直接レイヤーを追加
    console.log('🗺️ 【handleMapLoad】レイヤー追加開始...');

    // Separate layers: mesh first, then points on top
    const meshLayers = layers.filter(l => l.type === 'fill' || l.type === 'line');
    const pointLayers = layers.filter(l => l.type === 'symbol' || l.type === 'circle');
    const allLayers = [...meshLayers, ...pointLayers];

    console.log('📌 【handleMapLoad】pointLayers:', pointLayers);

    allLayers.forEach((layerConfig) => {
      if (!layerConfig || !layerConfig.id || !layerConfig.sourceData) return;

      const sourceId = layerConfig.source || layerConfig.id;

      try {
        // Add/update source
        if (!loadedSourcesRef.current.has(sourceId)) {
          mapInstance.addSource(sourceId, {
            type: 'geojson',
            data: layerConfig.sourceData
          });
          loadedSourcesRef.current.add(sourceId);
          console.log(`✅ Source added: ${sourceId}`);
        }

        // Add layer if not exists
        if (!mapInstance.getLayer(layerConfig.id)) {
          mapInstance.addLayer({
            id: layerConfig.id,
            type: layerConfig.type,
            source: sourceId,
            paint: layerConfig.paint,
            layout: layerConfig.layout
          });
          console.log(`✅ Layer added: ${layerConfig.id}`);
        }

        // Update visibility
        mapInstance.setLayoutProperty(layerConfig.id, 'visibility', layerConfig.visible ? 'visible' : 'none');
      } catch (e) {
        console.error(`❌ Failed to add layer ${layerConfig.id}:`, e);
      }
    });
  };

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
        onLoad={handleMapLoad}
      />
    </div>
  );
};
export default CombinationLayers;
