import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import AreaLayers from './AreaRenderLayers';
import BusStopNetworkMap from './BusStopNetworkMap';
import AccessibilityMatrixWithMeshid from './AccessibilityMatrixWithMeshid';
import { useBusNetworkStore } from './useBusNetworkStore';
import { useDataStore } from './useStore';

/**
 * メインのエリアタブコンポーネント
 * 左60%：地図 + バス停ネットワーク
 * 右40%：住所検索型アクセシビリティマトリックス
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
      console.log('📥 uploadedData is empty or not loaded');
      return;
    }

    console.log('📥 Processing uploadedData:', uploadedData);

    // アップロードされたデータから popmesh と ridingtime を抽出
    let newPopmeshData = null;
    const newRidingtimeData = [];

    uploadedData.forEach((file, index) => {
      try {
        let data = file;
        // ファイルオブジェクトの場合はパース
        if (typeof file === 'string') {
          data = JSON.parse(file);
        }

        console.log(`  [${index}] property:`, data?.property, 'hasData:', !!data?.data);

        if (data.property === 'popmesh' || data.property === 'addressed') {
          newPopmeshData = data;
          console.log('✅ popmesh/addressed データを取得');
        } else if (data.property === 'ridingtime_direct_dest' || data.property === 'ridingtime_transit_dest') {
          newRidingtimeData.push(data.data || []);
          console.log('✅ ridingtime データを取得');
        }
      } catch (error) {
        console.warn('⚠️ データ処理エラー:', error);
      }
    });

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
        <AreaLayers />
        <BusStopNetworkMap />
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
