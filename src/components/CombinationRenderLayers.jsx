import { useMemo, useState, useRef, useEffect } from 'react';
import React from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

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

  // Q1/Q2/Q3 最新データを取得（オブジェクト）
  const questions = useQuestionsStore((state) => state.questions);

  // ✅ 全ての Q1/Q2/Q3 データを取得（配列）
  const questionsList = useQuestionsStore((state) => state.questionsList);

  console.log('📋 【CombinationRenderLayers】questionsList:', questionsList);

  let nw=[132.590317,34.618206];
  let ne=[132.94325324146035,34.61707537902578];
  let sw=[132.56834478273046,34.27392753449381];
  let se=[132.90480109184705,34.292082779796985];
  const [address,setAddress]=useState("None");
  const question =useQuestionStore((state)=> state.questionsList);

  const layers = useMemo(() => {
    // ✅ useMemo の中で layers_row を定義
    let layers_row=[];

    console.log('🔄 【useMemo】questions:', questions);

      const q3_hour = Math.round(time * 100000000) + 11;

      // Q3の到着時間が一致した時だけ表示
      const isQ3Match = questions?.q3_arrival_time === q3_hour;
      questionsList.forEach((q, index) => {
        let residentPointLayer = {
          id: `resident-point-layer-${index}`,  // ✅ 一意の ID
          type: 'circle',
          sourceData: {
            type: 'FeatureCollection',
            features: [  // ✅ 配列
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [q.q2_longitude, q.q2_latitude]
                },
                properties: {
                  address: q.address,
                  q1_destination: q.q1_destination,
                }
              }
            ]
          },
          paint: {
            'circle-radius': 3,
            'circle-color': '#0000ff',
            'circle-opacity': 0.9,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff'
          },
          layout: {},
          visible: true,
          hoverType: 'resident',
          clickHandler: (feature) => {
            console.log('🏘️ 住民の位置をクリック:', feature.properties);
          }
        };

        layers_row.push(residentPointLayer);
      });
      }
    )

    // Q1/Q2/Q3 データからポイントレイヤーを生成
    if (questions &&
        questions.q1_destination &&
        questions.q1_destination === dest &&
        questions.q2_latitude &&
        questions.q2_longitude) {
    }

    console.log('📌 【useMemo】layers_row:', layers_row);
    return layers_row;
  }, [questions, questionsList, time, dest, question]);
  // Map reference for Mapbox GL JS
  const mapRef = useRef(null);
  const loadedSourcesRef = useRef(new Set());
  const clickHandlersRef = useRef({});
  const isFirstFlyToRef = useRef(true); // ✅ 初回 flyTo フラグ

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

  // ✅ 1️⃣ Mapbox GL JS マップを初期化（マウント時に1回だけ）
  useEffect(() => {
    if (!mapRef.current) return;

    mapboxgl.accessToken = mapboxAccessToken;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: mapstyle,
      center: [viewDemand.longitude || 132.741, viewDemand.latitude || 34.423],
      zoom: viewDemand.zoom || 12,
      pitch: viewDemand.pitch || 0,
      bearing: viewDemand.bearing || 0,
    });

    console.log('🗺️ 【useEffect】Mapbox GL JS Map created');

    // Move イベント
    const handleMove = () => {
      setviewDemand({
        longitude: map.getCenter().lng,
        latitude: map.getCenter().lat,
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      });
    };
    map.on('move', handleMove);

    // mapRef に Map インスタンスを保存
    mapRef.current._map = map;

    // クリーンアップ
    return () => {
      map.off('move', handleMove);
      map.remove();
    };
  }, []); // マウント時に1回だけ

  // ✅ 2️⃣ レイヤーを追加・更新（layers 変更時）
  useEffect(() => {
    if (!mapRef.current || !mapRef.current._map) return;

    const map = mapRef.current._map;

    if (!map.isStyleLoaded?.()) {
      console.log('⏳ マップスタイル未読み込み');
      return;
    }

    console.log('🗺️ 【useEffect(layers)】レイヤー追加開始...');

    // Separate layers: mesh first, then points on top
    const meshLayers = layers.filter(l => l.type === 'fill' || l.type === 'line');
    const pointLayers = layers.filter(l => l.type === 'symbol' || l.type === 'circle');
    const allLayers = [...meshLayers, ...pointLayers];

    console.log('📌 【useEffect(layers)】pointLayers:', pointLayers);

    allLayers.forEach((layerConfig) => {
      if (!layerConfig || !layerConfig.id || !layerConfig.sourceData) return;

      const sourceId = layerConfig.source || layerConfig.id;

      try {
        // Add/update source
        if (!loadedSourcesRef.current.has(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: layerConfig.sourceData
          });
          loadedSourcesRef.current.add(sourceId);
          console.log(`✅ Source added: ${sourceId}`);
        } else {
          const source = map.getSource(sourceId);
          if (source && source.setData) {
            source.setData(layerConfig.sourceData);
          }
        }

        // Add layer if not exists
        if (!map.getLayer(layerConfig.id)) {
          map.addLayer({
            id: layerConfig.id,
            type: layerConfig.type,
            source: sourceId,
            paint: layerConfig.paint,
            layout: layerConfig.layout
          });
          console.log(`✅ Layer added: ${layerConfig.id}`);
        }

        // Update visibility
        if (map.getLayer(layerConfig.id)) {
          map.setLayoutProperty(layerConfig.id, 'visibility', layerConfig.visible ? 'visible' : 'none');
        }
      } catch (e) {
        console.error(`❌ Failed to add layer ${layerConfig.id}:`, e);
      }
    });
  }, [layers]);


  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Mapbox GL JS マップコンテナ */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      >
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
          <p>{address}</p>
        </div>
      </div>
    </div>
  );
};
export default CombinationLayers;
