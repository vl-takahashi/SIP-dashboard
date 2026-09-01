import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import AreaLayers from './AreaRenderLayers';
import BusStopNetworkMap from './BusStopNetworkMap';
import AccessibilityMatrixWithMeshid from './AccessibilityMatrixWithMeshid';
import { useBusNetworkStore } from './useBusNetworkStore';
// 📌 アップロードストアをインポート
import { useUploadStore } from './useUploadStore';

/**
 * メインのエリアタブコンポーネント
 * 左60%：地図 + バス停ネットワーク
 * 右40%：住所検索型のアクセシビリティマトリックス
 * 📌 AccessibilityTab でアップロードされたデータをストアから取得
 */
const AreaTab = () => {
  const [isLoading, setIsLoading] = useState(false);

  // 📌 ストアからデータを取得
  const popmeshData = useUploadStore((state) => state.popmeshData);
  const ridingtimeDataArray = useUploadStore((state) => state.ridingtimeDataArray);

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
        {/* 📌 ストアからデータを受け取り */}
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
