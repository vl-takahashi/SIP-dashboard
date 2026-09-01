import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, TextField, Alert } from '@mui/material';
import { useBusNetworkStore } from './useBusNetworkStore';
import { buildHourlyMatrix, getAllAddresses, getMeshidByAddress, searchAddresses } from './buildMatrixFromData';

/**
 * 住所対応のアクセシビリティマトリックス（デバッグ版）
 */
const AccessibilityMatrixWithMeshid = ({ popmeshData = null, ridingtimeDataArray = [] }) => {
  const [addressInput, setAddressInput] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedMeshid, setSelectedMeshid] = useState(null);
  const [matrixByHour, setMatrixByHour] = useState({});
  const [destinations, setDestinations] = useState([]);
  const [allAddresses, setAllAddresses] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [debugInfo, setDebugInfo] = useState('');

  // ファイル読み込み時に住所リストを取得
  useEffect(() => {
    console.log('🔍 useEffect: popmeshData, ridingtimeDataArray changed');
    console.log('popmeshData:', popmeshData);
    console.log('ridingtimeDataArray:', ridingtimeDataArray);

    if (popmeshData) {
      const addresses = getAllAddresses(popmeshData);
      setAllAddresses(addresses);
      const msg = `✅ 利用可能な住所: ${addresses.length} 件`;
      setDebugInfo(msg);
      console.log(msg);
      console.log('addresses:', addresses.slice(0, 5)); // 最初の5件を表示
    } else {
      setDebugInfo('❌ popmeshData が読み込まれていません');
      console.warn('❌ popmeshData が null');
    }
  }, [popmeshData, ridingtimeDataArray]);

  // 住所入力時、リアルタイムで候補を検索
  const handleAddressInput = (value) => {
    console.log('🔍 handleAddressInput called:', value);
    setAddressInput(value);

    if (!value.trim() || !popmeshData) {
      console.log('条件未満: value.trim()=', value.trim(), 'popmeshData=', !!popmeshData);
      setFilteredAddresses([]);
      return;
    }

    const query = value.trim();
    console.log('⚙️ searching for:', query);
    const matched = searchAddresses(popmeshData, query);
    console.log('📋 matched addresses:', matched);
    setFilteredAddresses(matched.slice(0, 10));
  };

  // 住所選択時、マトリックスを構築
  const selectAddress = (address) => {
    console.log('✅ selectAddress:', address);
    setSelectedAddress(address);
    setFilteredAddresses([]);
    setAddressInput(address);

    const meshid = getMeshidByAddress(popmeshData, address);
    console.log('meshid:', meshid);

    if (!meshid) {
      console.error('❌ メッシュIDが見つかりません');
      return;
    }

    setSelectedMeshid(meshid);

    const flatData = Array.isArray(ridingtimeDataArray)
      ? ridingtimeDataArray.flat()
      : [];

    console.log('flatData length:', flatData.length);

    const { matrixByHour: matrix, destinations: dests } = buildHourlyMatrix(
      flatData,
      meshid
    );

    setMatrixByHour(matrix);
    setDestinations(dests);
  };

  const [selectedHour, setSelectedHour] = useState(null);

  if (Object.keys(matrixByHour).length === 0) {
    return (
      <Box sx={{ padding: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 0.5 }}>
            🔍 住所から検索
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            JSONファイルからアップロードされた住所データを検索
          </Typography>
        </Box>

        {/* デバッグ情報 */}
        <Alert severity="info" sx={{ marginBottom: 2 }}>
          <Typography variant="caption">
            {debugInfo}
          </Typography>
        </Alert>

        {popmeshData && ridingtimeDataArray.length > 0 ? (
          <>
            {/* 住所検索フィールド */}
            <Box sx={{ position: 'relative', marginBottom: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="住所を入力（例: 八本松）"
                  value={addressInput}
                  onChange={(e) => handleAddressInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && filteredAddresses.length > 0 && selectAddress(filteredAddresses[0])}
                  sx={{ flex: 1 }}
                  autoComplete="off"
                />
              </Box>

              {/* 住所候補ドロップダウン */}
              {filteredAddresses.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '40px',
                    left: 0,
                    right: 0,
                    maxHeight: 250,
                    overflow: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    background: '#fff',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    zIndex: 10,
                  }}
                >
                  {filteredAddresses.map((addr, index) => (
                    <Box
                      key={index}
                      onClick={() => selectAddress(addr)}
                      sx={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderBottom: index < filteredAddresses.length - 1 ? '1px solid #f0f0f0' : 'none',
                        '&:hover': { background: '#f5f5f5' },
                        fontSize: 14,
                      }}
                    >
                      {addr}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            <Typography variant="caption" sx={{ color: '#666' }}>
              利用可能な住所: {allAddresses.length} 件
            </Typography>
          </>
        ) : (
          <Alert severity="warning" sx={{ marginTop: 2 }}>
            ⚠️ データが完全に読み込まれていません
            <br />
            popmeshData: {popmeshData ? '✅' : '❌'}
            <br />
            ridingtimeDataArray: {ridingtimeDataArray.length > 0 ? `✅ (${ridingtimeDataArray.length}件)` : '❌'}
          </Alert>
        )}
      </Box>
    );
  }

  // マトリックス表示
  return (
    <Box sx={{ padding: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 0.5 }}>
          📊 1時間刻みアクセシビリティマトリックス
        </Typography>
        <Typography variant="caption" sx={{ color: '#666' }}>
          住所: {selectedAddress} (メッシュID: {selectedMeshid})
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', marginBottom: 2 }}>
        <TextField
          size="small"
          placeholder="別の住所を検索"
          value={addressInput}
          onChange={(e) => handleAddressInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && filteredAddresses.length > 0 && selectAddress(filteredAddresses[0])}
          sx={{ width: '100%' }}
          autoComplete="off"
        />

        {filteredAddresses.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '40px',
              left: 0,
              right: 0,
              maxHeight: 250,
              overflow: 'auto',
              border: '1px solid #ddd',
              borderRadius: 1,
              background: '#fff',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              zIndex: 10,
            }}
          >
            {filteredAddresses.map((addr, index) => (
              <Box
                key={index}
                onClick={() => selectAddress(addr)}
                sx={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: index < filteredAddresses.length - 1 ? '1px solid #f0f0f0' : 'none',
                  '&:hover': { background: '#f5f5f5' },
                  fontSize: 14,
                }}
              >
                {addr}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        <Table size="small" sx={{ minWidth: 300 }}>
          <TableHead>
            <TableRow sx={{ background: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', fontSize: 12, padding: '8px 6px', minWidth: 70 }}>
                時間帯
              </TableCell>
              {destinations.map((dest) => (
                <TableCell
                  key={dest}
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: 11,
                    padding: '8px 4px',
                    minWidth: 80,
                  }}
                >
                  {dest}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {Object.entries(matrixByHour).map(([hour, slots]) => (
              <TableRow key={hour} sx={{ '&:hover': { background: '#fafafa' } }}>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    fontSize: 12,
                    padding: '8px 6px',
                    background: selectedHour === parseInt(hour) ? '#E3F2FD' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedHour(parseInt(hour))}
                >
                  {hour}:00
                </TableCell>

                {destinations.map((dest) => {
                  const icon = slots[dest] || '❌';
                  const iconColors = {
                    '✅': '#C8E6C9',
                    '⚠️': '#FFF9C4',
                    '❌': '#FFCDD2',
                  };

                  return (
                    <TableCell
                      key={`${hour}-${dest}`}
                      align="center"
                      sx={{
                        padding: '8px 4px',
                        background: iconColors[icon] || '#fff',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        },
                      }}
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

      <Box sx={{ marginTop: 2, padding: 1, background: '#f9f9f9', borderRadius: 1 }}>
        <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', marginBottom: 0.5 }}>
          凡例:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, background: '#C8E6C9', borderRadius: '2px' }} />
            <Typography variant="caption">✅ 30分以内</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, background: '#FFF9C4', borderRadius: '2px' }} />
            <Typography variant="caption">⚠️ 30-60分</Typography>
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

export default AccessibilityMatrixWithMeshid;
