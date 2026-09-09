import { useMemo, useRef, useEffect } from 'react';
import React from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

import { mapstyle } from "./Globalvariable";
import { useDestStore, useWeekdayStore, useTimesliderStore, useDataStore } from "./useStore";
import { useQuestionsStore } from "./useQuestionsStore";

const CombinationLayers = () => {
  const dest = useDestStore((state) => state.select);
  const time = useTimesliderStore((state) => state.time);
  const data = useDataStore((state) => state.data);
  const questionsList = useQuestionsStore((state) => state.questionsList);
  const Weekdayflag = useWeekdayStore((state) => state.selectflag);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const loadedSourcesRef = useRef(new Set());

  // ✅ 色判定関数（改良版）
  // タイムスライダー未選択時：どれかの時間帯では利用可能か判定
  // タイムスライダー選択時：選択時間vs他の時間帯で判定
  const evaluateCoordinateMatch = (q, ridingtimeArray) => {
    const isUnselected = time < 0;  // ✅ 未選択状態（time < 0）
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
      if (!q?.q2_latitude || !q?.q2_longitude) return null;

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

  // ✅ Mapbox GL 初期化・更新
  useEffect(() => {
    if (!mapContainer.current) return;

    // ✅ マップ初期化（最初の1回のみ）
    if (!map.current) {
      mapboxgl.accessToken = 'pk.eyJ1IjoiZ2Vvc3BhdGlhbCIsImEiOiJjbGRobzd5MjAwMGczM21vMDh6OTF4eHBhIn0.EhV4L80IF4VJvZS9e8Hh-g';

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapstyle,
        center: [132.75, 34.4],
        zoom: 11,
        pitch: 45,
        bearing: 0,
      });

      map.current.on('load', () => {
        console.log('🗺️ Mapbox GL 読み込み完了');

        // ✅ points ソースを追加
        map.current.addSource('points', {
          type: 'geojson',
          data: pointsGeoJSON,
        });

        // ✅ circle レイヤーを追加（シンプルなポイント表示）
        map.current.addLayer({
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

        // ✅ ホバーエフェクト
        map.current.on('mousemove', 'points-layer', () => {
          map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', 'points-layer', () => {
          map.current.getCanvas().style.cursor = '';
        });

        // ✅ クリックで情報表示
        map.current.on('click', 'points-layer', (e) => {
          const properties = e.features[0].properties;
          console.log('📍 ポイントクリック:', properties);
        });
      });
    } else {
      // ✅ ソース更新
      if (loadedSourcesRef.current.has('points')) {
        const source = map.current.getSource('points');
        if (source && source.setData) {
          source.setData(pointsGeoJSON);
          console.log('📊 ポイント更新:', {
            count: pointsGeoJSON.features.length,
          });
        }
      }
    }
  }, [pointsGeoJSON]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: 'calc(100vh - 200px)',
      }}
    />
  );
};

export default CombinationLayers;
