import { useEffect } from 'react';
import { useBusNetworkStore } from './useBusNetworkStore';
import { mergeMultipleRouteData } from './buildAccessibilityMatrix';

/**
 * 地区選択時にデータを読み込んで、マトリックスを構築するカスタムフック
 * @param {string} selectedArea - 選択された地区ID/名前
 * @param {Object} routeData - { destination: jsonData } 形式のデータマッピング
 */
export const useLoadNetworkData = (selectedArea, routeData) => {
  const setNetworkData = useBusNetworkStore((state) => state.setNetworkData);

  useEffect(() => {
    if (!selectedArea || !routeData || Object.keys(routeData).length === 0) {
      return;
    }

    try {
      // マトリックスを構築
      const networkData = mergeMultipleRouteData(routeData);

      // Zustandストアに反映
      setNetworkData(networkData);

      console.log('Network data loaded:', networkData);
    } catch (error) {
      console.error('Failed to load network data:', error);
    }
  }, [selectedArea, routeData, setNetworkData]);
};

/**
 * 複数のJSONファイルを読み込むユーティリティ
 * 実装例：地区に対応したJSONファイルを動的に読み込む
 */
export const loadRouteDataForArea = async (areaId) => {
  try {
    // 実装例：各目的地のJSONファイルを読み込む
    const destinations = ['JR西条駅', '東広島記念病院', '広島市役所'];

    const dataMapping = {};

    // 本来はこのようなファイルパスを動的に構築して読み込む
    // for (const dest of destinations) {
    //   const filename = `chronogical_ridingtime_directto${dest}.json`;
    //   const response = await fetch(`/data/${areaId}/${filename}`);
    //   dataMapping[dest] = await response.json();
    // }

    // ここでは仮データを返す
    return dataMapping;
  } catch (error) {
    console.error('Failed to load route data:', error);
    return {};
  }
};

/**
 * マトリックスデータを手動で設定するヘルパー関数
 * テスト・デバッグ用
 */
export const setTestNetworkData = () => {
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

  const store = useBusNetworkStore.getState();
  store.setNetworkData({
    matrix: testData,
    destinations,
    score: 60,
    busStop,
  });
};
