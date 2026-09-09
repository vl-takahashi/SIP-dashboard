import { useMemo, useRef, useEffect } from 'react';
import React from 'react';
import mapboxgl from 'mapbox-gl';
import * as THREE from 'three';
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
  const threeSceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);  // ✅ camera を useRef に保存

  // ✅ 色判定関数
  const evaluateCoordinateMatch = (q, ridingtimeArray) => {
    const q3_hour = Math.round(time * 100000000) + 11;

    if (!q?.q2_latitude || !q?.q2_longitude) return [0.5, 0.5, 0.5]; // グレー
    if (!Weekdayflag) return [0.5, 0.5, 0.5];

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

    if (currentTimeMatch) return [0.235, 0.51, 0.96];   // 青 RGB
    else if (otherTimeMatch) return [0.96, 0.62, 0.04]; // 黄 RGB
    else return [0.94, 0.27, 0.27];                     // 赤 RGB
  };

  // ✅ Mapbox GL + Three.js 初期化
  useEffect(() => {
    if (!mapContainer.current) return;

    // ✅ Mapbox GL 初期化
    if (!map.current) {
      mapboxgl.accessToken = mapboxAccessToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapstyle,  // ✅ AccessibilityTab と同じカスタムスタイル（OSM タイル）
        center: [132.75, 34.4],
        zoom: 11,
        pitch: 45,
        bearing: 0,
      });

      map.current.on('load', () => {
        console.log('🗺️ Mapbox GL 読み込み完了');

        // ✅ Three.js scene 作成
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        threeSceneRef.current = scene;

        // ✅ Three.js renderer 作成
        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          canvas: document.createElement('canvas'),
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        rendererRef.current = renderer;

        // ✅ Three.js camera 作成
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          10000
        );
        camera.position.set(0, 0, 50);
        cameraRef.current = camera;  // ✅ camera を useRef に保存

        // ✅ 照明追加
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(10, 10, 10);
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // ✅ Mapbox カスタムレイヤーを追加
        const customLayer = {
          id: 'three-layer',
          type: 'custom',
          renderingContext: 'webgl',
          onAdd() {
            console.log('✅ Three.js レイヤー追加');
          },
          render() {
            // ✅ scene, renderer, camera が存在するか確認
            if (!threeSceneRef.current || !rendererRef.current || !cameraRef.current) {
              console.warn('⚠️ scene、renderer、または camera がまだ初期化されていません');
              return;
            }

            try {
              // Three.js レンダリング
              rendererRef.current.resetState();
              rendererRef.current.render(threeSceneRef.current, cameraRef.current);
              map.current.triggerRepaint();
            } catch (error) {
              console.error('❌ Three.js render エラー:', error);
            }
          },
        };

        map.current.addLayer(customLayer);
        console.log('✅ Mapbox カスタムレイヤー追加完了');
      });
    }

    // ✅ Three.js scene にポイント群を追加
    const updateScene = () => {
      if (!threeSceneRef.current) return;

      const scene = threeSceneRef.current;
      const ridingtimeArray = data?.["ridingtime_direct_dest"] || [];

      // 既存の sphere を削除
      const spheres = scene.children.filter((child) => child instanceof THREE.Mesh);
      spheres.forEach((sphere) => scene.remove(sphere));

      // 新しい sphere を追加
      questionsList.forEach((q, index) => {
        if (!q?.q2_latitude || !q?.q2_longitude) return;

        const color = evaluateCoordinateMatch(q, ridingtimeArray);

        // ✅ チャットボットから送信された q3_arrival_time を使用
        // q3_arrival_time が null の場合は、タイムスライダーの値から計算
        const q3_hour = q.q3_arrival_time !== null && q.q3_arrival_time !== undefined
          ? q.q3_arrival_time
          : (Math.round(time * 100000000) + 11);

        // ✅ KV から取得した緯度経度をそのまま 3D 座標として使用
        const x = q.q2_longitude;  // 経度（東西方向）
        const y = q.q2_latitude;   // 緯度（南北方向）
        const z = (q.q3_arrival_time || 1) * 5;  // Z 軸に時間帯（null なら 1）

        // ✅ Three.js sphere 作成
        const geometry = new THREE.SphereGeometry(3, 16, 16);
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color(...color),
          emissive: new THREE.Color(...color),
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, z);
        sphere.userData = {
          destination: q.q1_destination,
          address: q.address,
          hour: q3_hour,
        };

        scene.add(sphere);

        console.log(`📍 Sphere ${index}:`, { x, y, z, color });
      });

      console.log('📊 Three.js Scene 更新:', { count: questionsList.length });
    };

    // scene の更新
    if (map.current && map.current.isStyleLoaded()) {
      updateScene();
    } else {
      map.current?.on('style.load', updateScene);
    }
  }, [questionsList, time, dest, Weekdayflag, data]);

  // ✅ ウィンドウリサイズ対応
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current) {
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
