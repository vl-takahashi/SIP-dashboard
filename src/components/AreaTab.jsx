import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
// import AreaLayers from './AreaRenderLayers'; // TODO: Migrate to Mapbox
import BusStopNetworkMap from './BusStopNetworkMap';
import AccessibilityMatrixWithMeshid from './AccessibilityMatrixWithMeshid';
import { useBusNetworkStore } from './useBusNetworkStore';
// 📌 既存の useDataStore をインポート
import { useDataStore } from './useStore';

/**
 * メインのエリアタブコンポーネント
 * 左60%：地図 + バス停ネットワーク
 * 右40%：住所検索型のアクセシビリティマトリックス
 * 📌 AccessibilityTab でアップロードされたデータを useDataStore から取得
 */
const AreaTab = () => {
  const [isLoading, setIsLoading] = useState(false);

  // 📌 useDataStore からアップロードされたデータを取得
  const uploadedData = useDataStore((state) => state.data);

  // アップロードされたデータを処理
  const [popmeshData, setPopmeshData] = useState(null);
  const [ridingtimeDataArray, setRidingtimeDataArray] = useState([]);

  useEffect(() => {
    if (!uploadedData || uploadedData.length === 0) {
      return;
    }

    // アップロードされたデータから popmesh と ridingtime を抽出
    let newPopmeshData = null;
    let newRidingtimeData = [];
    console.log(uploadedData);
    for (const [key, data1] of Object.entries(uploadedData)){
      for (const d of data1){

        try {
          let data = d;
          // ファイルオブジェクトの場合はパース
          if (typeof d === 'string') {
            data = JSON.parse(d);
          }

          if (key === 'popmesh' || key === 'addressed') {
            newPopmeshData = data[2];
            console.log('✅ popmesh/addressed データを取得:', data);
          } else if (key === 'ridingtime_direct_dest' || key === 'ridingtime_transit_dest') {
            newRidingtimeData.push(data[2] || []);
            console.log('✅ ridingtime データを取得:', data[2]);
          }
        } catch (error) {
          console.warn('⚠️ データ処理エラー:', error);
        }
      }
    };

    if (newPopmeshData) {
      setPopmeshData(newPopmeshData);
    }
    if (newRidingtimeData.length > 0) {
      setRidingtimeDataArray(newRidingtimeData);
    }
  }, [uploadedData]);

  return (
    <Box
      sx={{
        display: 'flex',
        width: '80vw',
        height: '80vh',
        position: 'relative',
        background: '#fff',
        border: '1px solid #ccc',
      }}
    >
      {/* 左60% - 地図＋バス停ネットワーク */}
      <Box
        sx={{
          width: '60%',
          height: '100%',
          position: 'relative',
          borderRight: '1px solid #e0e0e0',
          overflow: 'hidden',
        }}
      >
        {/* <AreaLayers /> */} {/* TODO: Migrate to Mapbox */}
        
      </Box>

      {/* 右40% - マトリックス（住所検索型） */}
      <Box
        sx={{
          width: '40%',
          height: '100%',
          overflow: 'auto',
          background: '#fff',
          position: 'relative',
        }}
      >
        {/* 📌 useDataStore から取得したデータを受け取り */}
        <AccessibilityMatrixWithMeshid
          popmeshData={popmeshData}
          ridingtimeDataArray={ridingtimeDataArray}
        />
        <BusStopNetworkMap />
      </Box>

      {/* ローディング表示 */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            padding: 2,
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            borderRadius: 2,
          }}
        >
          データ読み込み中...
        </Box>
      )}
    </Box>
  );
};

export default AreaTab;
