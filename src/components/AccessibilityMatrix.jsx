import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button } from '@mui/material';
import { useBusNetworkStore } from './useBusNetworkStore';

/**
 * 時間帯×目的地のアクセシビリティマトリックス
 * 右40%パネル用
 */
const AccessibilityMatrix = () => {
  const [fileInput] = useState();
  const {
    accessibleDestinations,
    selectedRoute,
    selectedTimeSlot,
    setSelectedRoute,
    setSelectedTimeSlot,
    matrix,
    setNetworkData,
  } = useBusNetworkStore();

  // 初期データ設定
  useEffect(() => {
    if (Object.keys(matrix).length === 0) {
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

  // 時間帯の定義
  const timeSlots = ['06-09', '09-18', '18-22', '22-06'];

  // ファイルアップロード処理
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files) return;

    console.log('アップロードファイル:', files);
    // ここでマトリックスデータを更新
  };

  // マトリックスデータの構築
  const buildMatrix = () => {
    if (!accessibleDestinations || Object.keys(matrix).length === 0) {
      return {};
    }

    const result = {};
    accessibleDestinations.forEach((dest) => {
      result[dest.name] = {};
      timeSlots.forEach((slot) => {
        result[dest.name][slot] = matrix[dest.name]?.[slot] || '❌';
      });
    });

    return result;
  };

  const matrixData = useMemo(() => buildMatrix(), [accessibleDestinations, matrix]);

  // アクセシビリティを数値で判定
  const getAccessibilityValue = (icon) => {
    if (icon === '✅') return 2;
    if (icon === '⚠️') return 1;
    return 0;
  };

  // セルの背景色
  const getCellColor = (icon) => {
    const value = getAccessibilityValue(icon);
    if (value === 2) return '#C8E6C9';
    if (value === 1) return '#FFF9C4';
    return '#FFCDD2';
  };

  // 選択状態のスタイル
  const getSelectedStyle = (destination, timeSlot) => {
    const isSelected = selectedRoute?.destination === destination && selectedRoute?.timeSlot === timeSlot;
    return isSelected
      ? {
          border: '2px solid #2196F3',
          boxShadow: 'inset 0 0 4px rgba(33, 150, 243, 0.3)',
        }
      : {};
  };

  if (Object.keys(matrixData).length === 0) {
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
        <Typography variant="body2">データを読み込み中...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー＋アップロードボタン */}
      <Box sx={{ marginBottom: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 0.5 }}>
            📊 アクセシビリティマトリックス
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            時間帯 × 目的地でクリックして詳細表示
          </Typography>
        </Box>

        {/* ファイルアップロード */}
        <Box>
          <input
            ref={fileInput}
            type="file"
            accept=".json"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            id="matrix-file-input"
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => document.getElementById('matrix-file-input').click()}
            sx={{ whiteSpace: 'nowrap' }}
          >
            📤 データ読込
          </Button>
        </Box>
      </Box>

      {/* マトリックステーブル */}
      <Box sx={{ overflow: 'auto', flex: 1 }}>
        <Table size="small" sx={{ minWidth: 300 }}>
          <TableHead>
            <TableRow sx={{ background: '#f5f5f5' }}>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  fontSize: 12,
                  padding: '8px 6px',
                  minWidth: 80,
                  borderRight: '1px solid #ddd',
                }}
              >
                目的地
              </TableCell>
              {timeSlots.map((slot) => (
                <TableCell
                  key={slot}
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: 11,
                    padding: '8px 4px',
                    minWidth: 60,
                    background: selectedTimeSlot === slot ? '#E3F2FD' : 'transparent',
                    cursor: 'pointer',
                    borderBottom: selectedTimeSlot === slot ? '3px solid #2196F3' : '1px solid #ddd',
                    transition: 'all 0.2s',
                    '&:hover': {
                      background: '#F0F0F0',
                    },
                  }}
                  onClick={() => setSelectedTimeSlot(slot)}
                >
                  {slot}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {Object.entries(matrixData).map(([destination, slots]) => (
              <TableRow key={destination} sx={{ '&:hover': { background: '#fafafa' } }}>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    fontSize: 12,
                    padding: '8px 6px',
                    borderRight: '1px solid #ddd',
                  }}
                >
                  {destination}
                </TableCell>

                {timeSlots.map((slot) => {
                  const icon = slots[slot];
                  return (
                    <TableCell
                      key={`${destination}-${slot}`}
                      align="center"
                      sx={{
                        padding: '8px 4px',
                        background: getCellColor(icon),
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                        borderRadius: 1,
                        margin: '2px',
                        ...getSelectedStyle(destination, slot),
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        },
                      }}
                      onClick={() =>
                        setSelectedRoute({
                          destination,
                          timeSlot: slot,
                        })
                      }
                    >
                      {icon}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* 凡例 */}
      <Box sx={{ marginTop: 2, padding: 1, background: '#f9f9f9', borderRadius: 1 }}>
        <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', marginBottom: 0.5 }}>
          凡例:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, background: '#C8E6C9', borderRadius: '2px' }} />
            <Typography variant="caption">✅ 利用可能</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, background: '#FFF9C4', borderRadius: '2px' }} />
            <Typography variant="caption">⚠️ 時間がかかる</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, background: '#FFCDD2', borderRadius: '2px' }} />
            <Typography variant="caption">❌ 運行なし</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AccessibilityMatrix;
