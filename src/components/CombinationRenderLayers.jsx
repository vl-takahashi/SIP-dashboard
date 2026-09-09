import { useMemo, useRef, useEffect, useState } from 'react';
import React from 'react';
import * as Plotly from 'plotly.js-dist-min';

import { mapboxAccessToken } from "./Globalvariable";
import { useDestStore, useWeekdayStore, useTimesliderStore, useDataStore } from "./useStore";
import { useQuestionsStore } from "./useQuestionsStore";

const CombinationLayers = () => {
  const dest = useDestStore((state) => state.select);
  const time = useTimesliderStore((state) => state.time);
  const data = useDataStore((state) => state.data);
  const questionsList = useQuestionsStore((state) => state.questionsList);
  const Weekdayflag = useWeekdayStore((state) => state.selectflag);

  const plotDiv = useRef(null);
  const [mapDataUrl, setMapDataUrl] = useState(null);

  // ✅ 色判定関数（既存ロジックを維持）
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
      const point = { type: 'Point', coordinates: [q.q2_longitude, q.q2_latitude] };

      const inMesh = directmeshids.some((meshid) => {
        const feature = popmeshFeatures.find((f) => f.properties?.MESH_ID === meshid);
        if (!feature) return false;

        // 簡易的なポイントイン判定
        const coords = feature.geometry.coordinates;
        return pointInPolygon(point.coordinates, coords);
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

  // ✅ シンプルなポイントイン判定（turf の代わり）
  const pointInPolygon = (point, polygonCoords) => {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygonCoords[0].length - 1; i < polygonCoords[0].length; j = i++) {
      const [xi, yi] = polygonCoords[0][i];
      const [xj, yj] = polygonCoords[0][j];

      const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  };

  // ✅ Mapbox Static Image API で背景地図を取得
  const generateMapBackground = async (minLng, maxLng, minLat, maxLat) => {
    try {
      const centerLng = (minLng + maxLng) / 2;
      const centerLat = (minLat + maxLat) / 2;

      // ✅ Mapbox Static Image API URL
      // フォーマット: https://api.mapbox.com/styles/v1/{username}/{id}/static/{lon},{lat},{zoom},{bearing},{pitch}/@{retina}/{width}x{height}
      const zoom = 12;
      const width = 600;
      const height = 600;

      const url = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${centerLng},${centerLat},${zoom},0,0/${width}x${height}@2x?access_token=${mapboxAccessToken}`;

      console.log('🗺️ 背景地図 URL:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const dataUrl = URL.createObjectURL(blob);

      setMapDataUrl(dataUrl);
      console.log('✅ Mapbox Static Image 取得完了');

      return dataUrl;
    } catch (error) {
      console.error('❌ Mapbox Static Image エラー:', error);
      return null;
    }
  };

  // ✅ 3D Scatter データ生成
  const plotData = useMemo(() => {
    const ridingtimeArray = data?.["ridingtime_direct_dest"] || [];

    const xData = [];
    const yData = [];
    const zData = [];
    const colors = [];
    const labels = [];

    questionsList.forEach((q) => {
      if (!q?.q2_latitude || !q?.q2_longitude) return;

      xData.push(q.q2_longitude);
      yData.push(q.q2_latitude);

      const zValue = Math.round(time * 100000000) + 11; // 希望到着時間帯
      zData.push(zValue);

      const color = evaluateCoordinateMatch(q, ridingtimeArray);
      colors.push(color);

      labels.push(`目的地: ${q.q1_destination}<br>座標: ${q.q2_latitude.toFixed(4)}, ${q.q2_longitude.toFixed(4)}<br>時間: ${zValue}時`);
    });

    const colorMap = {
      '#3b82f6': 'blue',
      '#f59e0b': 'orange',
      '#ef4444': 'red',
      '#888888': 'gray',
    };

    const trace = {
      x: xData,
      y: yData,
      z: zData,
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 8,
        color: colors.map((c) => colorMap[c] || c),
        opacity: 0.8,
        line: {
          color: '#ffffff',
          width: 2,
        },
      },
      text: labels,
      hoverinfo: 'text',
    };

    return [trace];
  }, [questionsList, time, dest, Weekdayflag, data]);

  // ✅ 背景地図を Z=0 層に追加
  const addMapBackground = (data, minLng, maxLng, minLat, maxLat) => {
    // 地図グリッドを背景として追加（メッシュ可視化の代わり）
    const gridX = [];
    const gridY = [];
    const gridZ = [];

    // グリッド線を引く
    for (let lng = Math.floor(minLng * 100) / 100; lng <= maxLng; lng += 0.02) {
      for (let lat = Math.floor(minLat * 100) / 100; lat <= maxLat; lat += 0.02) {
        gridX.push(lng);
        gridY.push(lat);
        gridZ.push(11); // Z=11（最小時間帯）に配置
      }
    }

    const gridTrace = {
      x: gridX,
      y: gridY,
      z: gridZ,
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 1,
        color: 'rgba(200, 200, 200, 0.1)',
      },
      hoverinfo: 'skip',
      name: 'Background Grid',
    };

    return [...data, gridTrace];
  };

  // ✅ Plotly 3D 描画
  useEffect(() => {
    if (!plotDiv.current) return;

    let finalData = plotData;

    // グリッド背景を追加
    if (questionsList.length > 0) {
      const lngs = questionsList.map((q) => q.q2_longitude).filter(Boolean);
      const lats = questionsList.map((q) => q.q2_latitude).filter(Boolean);

      if (lngs.length > 0 && lats.length > 0) {
        const minLng = Math.min(...lngs) - 0.05;
        const maxLng = Math.max(...lngs) + 0.05;
        const minLat = Math.min(...lats) - 0.05;
        const maxLat = Math.max(...lats) + 0.05;

        finalData = addMapBackground(plotData, minLng, maxLng, minLat, maxLat);
      }
    }

    const layout = {
      title: '時空間需要分析 (3D)',
      scene: {
        xaxis: {
          title: '経度 (Longitude)',
          backgroundcolor: 'rgba(230, 230,250, 0.5)',
          gridcolor: 'white',
          showbackground: true,
        },
        yaxis: {
          title: '緯度 (Latitude)',
          backgroundcolor: 'rgba(230, 250,230, 0.5)',
          gridcolor: 'white',
          showbackground: true,
        },
        zaxis: {
          title: '到着希望時間帯 (Hour)',
          backgroundcolor: 'rgba(250, 230, 230, 0.5)',
          gridcolor: 'white',
          showbackground: true,
        },
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1.3 },
        },
      },
      margin: { l: 0, r: 0, t: 50, b: 0 },
      height: window.innerHeight - 200,
      paper_bgcolor: '#f8f9fa',
    };

    const config = {
      responsive: true,
      displayModeBar: true,
    };

    Plotly.newPlot(plotDiv.current, finalData, layout, config);

    console.log('📊 3D Scatter プロット更新:', { count: plotData[0].x.length });
  }, [plotData, questionsList]);

  // ✅ 背景地図を取得
  useEffect(() => {
    if (questionsList.length === 0) return;

    const lngs = questionsList.map((q) => q.q2_longitude).filter(Boolean);
    const lats = questionsList.map((q) => q.q2_latitude).filter(Boolean);

    if (lngs.length > 0 && lats.length > 0) {
      const minLng = Math.min(...lngs) - 0.05;
      const maxLng = Math.max(...lngs) + 0.05;
      const minLat = Math.min(...lats) - 0.05;
      const maxLat = Math.max(...lats) + 0.05;

      generateMapBackground(minLng, maxLng, minLat, maxLat);
    }
  }, [questionsList]);

  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100vh - 200px)',
        backgroundImage: mapDataUrl ? `url(${mapDataUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      {/* ✅ Plotly を透明にして背景地図を透ける */}
      <div
        ref={plotDiv}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.05)', // ほぼ透明
        }}
      />
    </div>
  );
};

export default CombinationLayers;
