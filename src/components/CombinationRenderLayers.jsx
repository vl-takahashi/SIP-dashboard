import { useMemo, useRef, useEffect } from 'react';
import React from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

import { mapboxAccessToken, mapstyle } from "./Globalvariable";
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

  // ✅ 色判定関数
  const evaluateCoordinateMatch = (q, ridingtimeArray) => {
    const q3_hour = Math.round(time * 100000000) + 11;

    if (!q?.q2_latitude || !q?.q2_longitude) return '#888888';
    if (!Weekdayflag) return '#888888';

    const popmeshFeatures = data?.["popmesh"]?.data?.features || [];

    let currentTimeMatch = false;
    let otherTimeMatch = false;

    for (const meshData of ridingtimeArray) {
      if (!meshData?.condition || !meshData?.data) continue;

      const { condition } = meshData;
      const isDestMatch = condition.to === dest;
      const isWeekdayMatch = condition.weekday === Weekdayflag;

      if (!isDestMatch || !isWeekdayMatch) continue;

      const directmeshids = meshData.data.flatMap((mesh) => mesh.directmeshid || []);
      const point = turf.point([q.q2_longitude, q.q2_latitude]);

      const inMesh = directmeshids.some((meshid) => {
        const feature = popmeshFeatures.find((f) => f.properties?.MESH_ID === meshid);
        return feature && turf.booleanPointInPolygon(point, feature);
      });

      if (!inMesh) continue;

      if (parseInt(condition.hour) === q3_hour) {
        currentTimeMatch = true;
      } else {
        otherTimeMatch = true;
      }
    }

    if (currentTimeMatch) return '#3b82f6'; // 青
    else if (otherTimeMatch) return '#f59e0b'; // 黄
    else return '#ef4444'; // 赤
  };

  // ✅ 点を小さなポリゴンに変換（3D buildings 用）
  const createPolygonFromPoint = (lng, lat, size = 0.0008) => {
    return [
      [lng - size, lat - size],
      [lng + size, lat - size],
      [lng + size, lat + size],
      [lng - size, lat + size],
      [lng - size, lat - size],
    ];
  };

  // ✅ GeoJSON FeatureCollection 生成
  const buildingsGeoJSON = useMemo(() => {
    const ridingtimeArray = data?.["ridingtime_direct_dest"] || [];

    const features = questionsList.map((q, index) => {
      if (!q?.q2_latitude || !q?.q2_longitude) return null;

      const color = evaluateCoordinateMatch(q, ridingtimeArray);
      const q3_hour = Math.round(time * 100000000) + 11;
      const height = Math.max(q3_hour * 50, 100); // スケーリング

      return {
        type: 'Feature',
        id: index,
        geometry: {
          type: 'Polygon',
          coordinates: [createPolygonFromPoint(q.q2_longitude, q.q2_latitude)],
        },
        properties: {
          height,
          color,
          destination: q.q1_destination,
          address: q.address,
          hour: q3_hour,
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
      mapboxgl.accessToken = mapboxAccessToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [132.75, 34.4],
        zoom: 11,
        pitch: 45,
        bearing: 0,
      });

      map.current.on('load', () => {
        console.log('🗺️ Mapbox GL 読み込み完了');

        // ✅ buildings ソースを追加
        map.current.addSource('buildings', {
          type: 'geojson',
          data: buildingsGeoJSON,
        });

        // ✅ fill-extrusion レイヤーを追加
        map.current.addLayer({
          id: '3d-buildings-layer',
          type: 'fill-extrusion',
          source: 'buildings',
          paint: {
            'fill-extrusion-color': ['get', 'color'],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.8,
          },
        });

        loadedSourcesRef.current.add('buildings');

        // ✅ ホバーエフェクト
        map.current.on('mousemove', '3d-buildings-layer', () => {
          map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', '3d-buildings-layer', () => {
          map.current.getCanvas().style.cursor = '';
        });

        // ✅ クリックで情報表示
        map.current.on('click', '3d-buildings-layer', (e) => {
          const properties = e.features[0].properties;
          console.log('🏢 Building クリック:', properties);
        });
      });
    } else {
      // ✅ ソース更新（buildings ソースが存在する場合）
      if (loadedSourcesRef.current.has('buildings')) {
        const source = map.current.getSource('buildings');
        if (source && source.setData) {
          source.setData(buildingsGeoJSON);
          console.log('📊 3D Buildings 更新:', {
            count: buildingsGeoJSON.features.length,
          });
        }
      }
    }
  }, [buildingsGeoJSON]);

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
