import React, { useMemo, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useBusNetworkStore } from './useBusNetworkStore';

/**
 * バス停をハブとした放射状ネットワークビュー
 * 左60%パネル用
 */
const BusStopNetworkMap = () => {
  const {
    nearestBusStop,
    accessibleDestinations,
    selectedRoute,
    selectedTimeSlot,
    setSelectedRoute,
    accessibilityScore,
    setNetworkData,
    matrix,
  } = useBusNetworkStore();

  // 初期データ設定
  useEffect(() => {
    if (!nearestBusStop) {
      const testData = {
        'JR西条駅': {
          '06-09': '✅',
          '09-18': '✅',
          '18-22': '⚠️',
          '22-06': '❌',
        },
        '東広島記念病院': {
          '06-09': '⚠️',
          '09-18': '✅',
          '18-22': '⚠️',
          '22-06': '❌',
        },
        '広島市役所': {
          '06-09': '❌',
          '09-18': '✅',
          '18-22': '❌',
          '22-06': '❌',
        },
        '商業施設': {
          '06-09': '❌',
          '09-18': '✅',
          '18-22': '⚠️',
          '22-06': '❌',
        },
      };

      const destinations = Object.keys(testData).map((name) => ({
        name,
        timeSlots: Object.keys(testData[name]).filter((slot) => testData[name][slot] !== '❌'),
        travelTime: '15分',
        line: '複数',
      }));

      const busStop = {
        name: '八本松駅',
        walk_time: 5,
        lat: 34.3622,
        lon: 132.7478,
      };

      setNetworkData({
        matrix: testData,
        destinations,
        score: 60,
        busStop,
      });
    }
  }, []);

  // SVG描画用の定数
  const SVG_WIDTH = 400;
  const SVG_HEIGHT = 500;
  const CENTER_X = SVG_WIDTH / 2;
  const CENTER_Y = SVG_HEIGHT / 2;
  const RADIUS = 120;
  const BUS_STOP_RADIUS = 12;

  // 目的地の配置角度を計算
  const getDestinationPositions = () => {
    if (!accessibleDestinations || accessibleDestinations.length === 0) {
      return [];
    }

    return accessibleDestinations.map((dest, index) => {
      const angle =
        (360 / accessibleDestinations.length) * index - 90; // -90で上からスタート
      const radian = (angle * Math.PI) / 180;
      const x = CENTER_X + RADIUS * Math.cos(radian);
      const y = CENTER_Y + RADIUS * Math.sin(radian);

      return {
        ...dest,
        x,
        y,
        angle,
      };
    });
  };

  const positions = useMemo(() => getDestinationPositions(), [accessibleDestinations]);

  // 時間帯別のアクセシビリティを判定
  const getAccessibilityIcon = (dest) => {
    if (!dest.timeSlots) return '❌';
    if (dest.timeSlots.includes(selectedTimeSlot)) {
      return '✅';
    }
    return '⚠️';
  };

  // 時間帯別カラー
  const getRouteColor = (dest) => {
    const icon = getAccessibilityIcon(dest);
    if (icon === '✅') return '#4CAF50';
    if (icon === '⚠️') return '#FFC107';
    return '#F44336';
  };

  if (!nearestBusStop || positions.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          padding: 2,
        }}
      >
        <Typography variant="body2">地区を選択してください</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2, background: '#f5f5f5', height: '100%', overflow: 'auto' }}>
      {/* 最寄りバス停の情報 */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          🚌 {nearestBusStop.name}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', marginBottom: 0.5 }}>
          徒歩 {nearestBusStop.walk_time} 分
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', marginBottom: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            ポテンシャル:
          </Typography>
          <Chip
            label={`⭐${(accessibilityScore / 20).toFixed(1)}/5`}
            color={accessibilityScore > 60 ? 'success' : 'warning'}
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>

      {/* 放射状ネットワーク図 */}
      <Box sx={{ marginBottom: 2, background: '#fff', borderRadius: 1, padding: 1 }}>
        <svg width="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ minHeight: 300 }}>
          {/* 放射線（バス停から各目的地へ） */}
          {positions.map((pos, index) => (
            <g key={`line-${index}`}>
              <line
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={pos.x}
                y2={pos.y}
                stroke={getRouteColor(pos)}
                strokeWidth="2"
                strokeDasharray={selectedRoute?.destination === pos.name ? '0' : '5,5'}
                opacity="0.6"
              />
            </g>
          ))}

          {/* バス停（中央） */}
          <circle cx={CENTER_X} cy={CENTER_Y} r={BUS_STOP_RADIUS} fill="#FF6B00" />
          <text
            x={CENTER_X}
            y={CENTER_Y + 25}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#333"
          >
            バス停
          </text>

          {/* 各目的地 */}
          {positions.map((pos, index) => (
            <g
              key={`dest-${index}`}
              onClick={() =>
                setSelectedRoute({
                  destination: pos.name,
                  timeSlot: selectedTimeSlot,
                  travelTime: pos.travelTime,
                  line: pos.line,
                })
              }
              style={{ cursor: 'pointer' }}
            >
              {/* 目的地の円 */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={BUS_STOP_RADIUS}
                fill={getRouteColor(pos)}
                opacity={selectedRoute?.destination === pos.name ? 1 : 0.7}
                stroke={selectedRoute?.destination === pos.name ? '#333' : 'none'}
                strokeWidth="2"
              />

              {/* アイコン */}
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#fff"
              >
                {getAccessibilityIcon(pos)}
              </text>

              {/* ラベル */}
              <text
                x={pos.x}
                y={pos.y + 35}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="#333"
              >
                {pos.name}
              </text>
              <text
                x={pos.x}
                y={pos.y + 50}
                textAnchor="middle"
                fontSize="10"
                fill="#666"
              >
                {pos.travelTime}分
              </text>
            </g>
          ))}
        </svg>
      </Box>

      {/* 凡例 */}
      <Box sx={{ fontSize: 12, color: '#666', marginTop: 2 }}>
        <Typography variant="caption" sx={{ display: 'block', marginBottom: 0.5 }}>
          ✅ = 利用可能 | ⚠️ = 時間がかかる | ❌ = 運行なし
        </Typography>
      </Box>

      {/* 選択中のルート詳細 */}
      {selectedRoute && (
        <Box
          sx={{
            marginTop: 2,
            padding: 1,
            background: '#E3F2FD',
            borderRadius: 1,
            borderLeft: '4px solid #2196F3',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: 0.5 }}>
            📍 {selectedRoute.destination}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
            所要時間: {selectedRoute.travelTime} 分
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
            路線: {selectedRoute.line || '複数'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BusStopNetworkMap;
