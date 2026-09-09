import { useMemo, useRef, useEffect } from 'react';
import React from 'react';
import mapboxgl from 'mapbox-gl';
import Map from 'react-map-gl/mapbox';
import * as turf from '@turf/turf';

import { mapstyle, mapboxAccessToken } from "./Globalvariable";
import { useDestStore,useViewCombinationStore, useWeekdayStore, useTimesliderStore, useDataStore } from "./useStore";
import { useQuestionsStore } from "./useQuestionsStore";

const CombinationLayers = () => {
  const dest = useDestStore((state) => state.select);
  const time = useTimesliderStore((state) => state.time);
  const data = useDataStore((state) => state.data);
  const questionsList = useQuestionsStore((state) => state.questionsList);
  const Weekdayflag = useWeekdayStore((state) => state.selectflag);
    const viewAccessibility=useViewCombinationStore((state) => state.select);

  const setviewCombination=useViewCombinationStore((state) => state.selectView);
  
    const mapRef = useRef(null);
  const map = useRef(null); // ✅ Mapbox GL Map インスタンス
  const loadedSourcesRef = useRef(new Set());

  // ✅ 色判定関数（改良版）
  // タイムスライダー未選択時：どれかの時間帯では利用可能か判定
  // タイムスライダー選択時：選択時間vs他の時間帯で判定
  const evaluateCoordinateMatch = (q, ridingtimeArray) => {
    const isUnselected = time === -7/100000000;  // ✅ 未選択状態（初期値と同じ）
    const q3_hour = Math.round(time * 100000000) + 11;

    if (!q?.q2_latitude || !q?.q2_longitude) return '#888888'; // グレー
    if (!Weekdayflag) return '#888888';

    const popmeshFeatures = data?.["popmesh"]?.data?.features || [];

    let currentTimeMatch = false;  // 現在の選択時間で合致
    let otherTimeMatch = false;    // 他の時間帯で合致

    for (const meshData of ridingtimeArray) {
      if (!meshData?.condition || !meshData?.data) continue;

      const { condition } = meshData;
      const isDestMatch = condition.to === dest;
      const isWeekdayMatch = condition.weekday === Weekdayflag;

      if (!isDestMatch || !isWeekdayMatch) continue;

      // メッシュ内判定
      const directmeshids = meshData.data.flatMap((mesh) => mesh.directmeshid || []);
      const point = turf.point([q.q2_longitude, q.q2_latitude]);
      const inMesh = directmeshids.some((meshid) => {
        const feature = popmeshFeatures.find((f) => f.properties?.MESH_ID === meshid);
        return feature && turf.booleanPointInPolygon(point, feature);
      });

      if (!inMesh) continue;

      if (isUnselected) {
        // ✅ 未選択時：どれかの時間帯で合致したら OK
        otherTimeMatch = true;
      } else {
        // ✅ 選択時：時間帯で分類
        if (parseInt(condition.hour) === q3_hour) {
          currentTimeMatch = true;  // 現在の選択時間で合致
        } else {
          otherTimeMatch = true;    // 他の時間帯で合致
        }
      }
    }

    // ✅ 未選択時の色分け
    if (isUnselected) {
      if (otherTimeMatch) {
        return '#3b82f6'; // 🔵 青：どれかの時間帯では利用可能
      } else {
        return '#ef4444'; // 🔴 赤：どの時間帯もアクセスできない
      }
    }

    // ✅ 選択時の色分け
    if (currentTimeMatch) {
      return '#3b82f6'; // 🔵 青：現在の時間帯で合致
    } else if (otherTimeMatch && !currentTimeMatch) {
      return '#f59e0b'; // 🟡 黄：現在の時間帯では合致しないが、他の時間帯では合致
    } else {
      return '#ef4444'; // 🔴 赤：どの時間帯もアクセスできない
    }
  };

  // ✅ GeoJSON FeatureCollection 生成（circle レイヤー用）
  const pointsGeoJSON = useMemo(() => {
    const ridingtimeArray = data?.["ridingtime_direct_dest"] || [];

    const features = questionsList.map((q, index) => {
      // ✅ 必須キーのいずれかが null なら除外
      const requiredKeys = ['q2_latitude', 'q2_longitude', 'q1_destination', 'q3_arrival_time', 'address', 'weekday'];
      if (requiredKeys.some(key => q?.[key] == null)) {
        console.warn(`⚠️ 除外: インデックス ${index} - 必須キー不足:`, q);
        return null;
      }

      const color = evaluateCoordinateMatch(q, ridingtimeArray);

      return {
        type: 'Feature',
        id: index,
        geometry: {
          type: 'Point',
          coordinates: [q.q2_longitude, q.q2_latitude],
        },
        properties: {
          color,
          destination: q.q1_destination,
          address: q.address,
          hour: q.q3_arrival_time || '未設定',
        },
      };
    }).filter(Boolean);

    return {
      type: 'FeatureCollection',
      features,
    };
  }, [questionsList, time, dest, Weekdayflag, data]);

  // ✅ Mapbox GL <Map> コンポーネントのレイヤー管理
  useEffect(() => {
    const mapboxMap = mapRef.current?.getMap?.();
    if (!mapboxMap || !mapboxMap.isStyleLoaded()) return;

    // ✅ points ソースを追加（初回のみ）
    if (!loadedSourcesRef.current.has('points')) {
      try {
        mapboxMap.addSource('points', {
          type: 'geojson',
          data: pointsGeoJSON,
        });

        // ✅ circle レイヤーを追加
        mapboxMap.addLayer({
          id: 'points-layer',
          type: 'circle',
          source: 'points',
          paint: {
            'circle-radius': 8,
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.9,
          },
        });

        loadedSourcesRef.current.add('points');
        console.log('🗺️ points レイヤー追加完了');
      } catch (error) {
        console.warn('⚠️ source 既に存在:', error.message);
      }
    } else {
      // ✅ ソース更新
      const source = mapboxMap.getSource('points');
      if (source && source.setData) {
        source.setData(pointsGeoJSON);
        console.log('📊 ポイント更新:', {
          count: pointsGeoJSON.features.length,
        });
      }
    }
  }, [pointsGeoJSON]);

  return (
      <div style={{ width: '100%', height: '100%' }}>
        <Map
          ref={mapRef}
          initialViewState={viewAccessibility}
          mapboxAccessToken={mapboxAccessToken}
          mapStyle={mapstyle}
          onMove={({ viewState }) => setviewCombination(viewState)}
        />
      </div>
  );
};

export default CombinationLayers;
