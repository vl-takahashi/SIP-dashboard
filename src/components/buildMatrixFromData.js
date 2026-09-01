/**
 * 乗車時間JSONとmeshidから、1時間刻みのマトリックスを構築
 */

/**
 * 乗車時間（秒）からアクセシビリティアイコンを決定
 * @param {number} ridingTime - 乗車時間（秒）
 * @returns {string} '✅', '⚠️', '❌'
 */
export const getAccessibilityIcon = (ridingTime) => {
  if (!ridingTime) return '❌';
  const minutes = ridingTime / 60;
  if (minutes <= 30) return '✅';
  if (minutes <= 60) return '⚠️';
  return '⚠️';
};

/**
 * ridingtimeDataArray から目的地（dest）を抽出
 * @param {Array} ridingtimeDataArray - ridingtime JSON の data配列
 * @returns {Array} 目的地の配列（重複なし）
 */
export const extractDestinations = (ridingtimeDataArray) => {
  const dests = new Set();

  if (!Array.isArray(ridingtimeDataArray)) {
    return [];
  }

  ridingtimeDataArray.forEach((record) => {
    if (record && record.condition && record.condition.to) {
      dests.add(record.condition.to);
    }
  });

  return Array.from(dests);
};

/**
 * ridingtime JSONとmeshidから1時間刻みのマトリックスを構築
 * @param {Array} ridingtimeDataArray - ridingtime JSON の data配列
 * @param {string} meshid - 検索対象のmeshid
 * @param {Array} destinations - 目的地名の配列（自動抽出される）
 * @returns {Object} { matrixByHour: { hour: { destination: icon } }, destinations }
 */
export const buildHourlyMatrix = (ridingtimeDataArray, meshid, destinations = []) => {
  // destが空の場合は、ridingtimeDataArrayから自動抽出
  if (destinations.length === 0) {
    destinations = extractDestinations(ridingtimeDataArray);
  }

  const matrixByHour = {};
  const dests = new Set(destinations);

  // 各時間帯（6-23）を初期化
  for (let hour = 6; hour < 24; hour++) {
    matrixByHour[hour] = {};
    Array.from(dests).forEach((dest) => {
      matrixByHour[hour][dest] = '❌';
    });
  }

  console.log('🔍 buildHourlyMatrix:', {
    meshid,
    dataLength: ridingtimeDataArray?.length,
    destinations: Array.from(dests),
  });

  // ridingtimeデータをループ
  if (!Array.isArray(ridingtimeDataArray) || ridingtimeDataArray.length === 0) {
    console.warn('⚠️ ridingtimeDataArray が空またはarray形式ではありません');
    return { matrixByHour, destinations: Array.from(dests) };
  }

  let foundData = 0;

  ridingtimeDataArray.forEach((record) => {
    if (!record) return;

    const condition = record.condition || {};
    const destination = condition.to;
    const hour = condition.hour;
    const data = record.data || [];

    if (!destination || typeof hour !== 'number') return;

    dests.add(destination);
    if (!matrixByHour[hour]) {
      matrixByHour[hour] = {};
    }

    // meshidに対応するルートを探す
    let minRidingTime = null;
    data.forEach((route) => {
      if (route && route.meshid && Array.isArray(route.meshid)) {
        if (route.meshid.includes(meshid)) {
          foundData++;
          if (!minRidingTime || route.ridingtime < minRidingTime) {
            minRidingTime = route.ridingtime;
          }
        }
      }
    });

    // アイコンを決定
    const icon = getAccessibilityIcon(minRidingTime);
    matrixByHour[hour][destination] = icon;

    console.log(`  ${hour}時 ${destination}: ${icon} (${minRidingTime ? minRidingTime / 60 + '分' : 'N/A'})`);
  });

  console.log(`✅ 合計マッチ件数: ${foundData}`);

  return {
    matrixByHour,
    destinations: Array.from(dests),
  };
};

/**
 * addressed/popmesh JSONからすべてのメッシュIDを抽出
 * @param {Object} popmeshData - addressed/popmesh JSON
 * @returns {Array} meshidの配列
 */
export const getAllMeshids = (popmeshData) => {
  if (!popmeshData || !popmeshData.data || !popmeshData.data.features) {
    return [];
  }

  const features = popmeshData.data.features;
  const meshids = [];

  features.forEach((feature) => {
    const meshid = feature.properties?.MESH_ID;
    if (meshid) {
      meshids.push(meshid);
    }
  });

  return meshids;
};

/**
 * addressed/popmesh JSONからすべての住所（S_NAME）を抽出
 * @param {Object} popmeshData - addressed/popmesh JSON
 * @returns {Array} 住所の配列
 */
export const getAllAddresses = (popmeshData) => {
  console.log(popmeshData);
  if (!popmeshData || !popmeshData.features) {
    return [];
  }

  const features = popmeshData.features;
  const addresses = [];

  features.forEach((feature) => {
    const sName = feature.properties?.S_NAME;
    
    if (sName) {
      addresses.push(sName);
    }
  });

  // 重複を削除
  return Array.from(new Set(addresses));
};

/**
 * 住所（S_NAME）からメッシュIDを取得
 * @param {Object} popmeshData - addressed/popmesh JSON
 * @param {string} address - 検索する住所
 * @returns {string|null} メッシュID、見つからない場合はnull
 */
export const getMeshidByAddress = (popmeshData, address) => {
  if (!popmeshData || !popmeshData || !popmeshData.features) {
    return null;
  }

  const features = popmeshData.features;

  for (const feature of features) {
    if (feature.properties?.S_NAME === address) {
      return feature.properties?.MESH_ID || null;
    }
  }

  return null;
};

/**
 * 住所キーワードで検索
 * @param {Object} popmeshData - addressed/popmesh JSON
 * @param {string} keyword - 検索キーワード
 * @returns {Array} マッチした住所の配列
 */
export const searchAddresses = (popmeshData, keyword) => {
  if (!popmeshData || !popmeshData || !popmeshData.features) {
    return [];
  }

  const features = popmeshData.features;
  const addresses = [];

  features.forEach((feature) => {
    const sName = feature.properties?.S_NAME;
    if (sName && sName.includes(keyword)) {
      addresses.push(sName);
    }
  });

  // 重複を削除
  return Array.from(new Set(addresses));
};

/**
 * 指定meshidがデータ内に存在するか確認
 * @param {Object} popmeshData - addressed/popmesh JSON
 * @param {string} meshid - 検索meshid
 * @returns {boolean} 存在する場合true
 */
export const isMeshidValid = (popmeshData, meshid) => {
  if (!popmeshData || !popmeshData || !popmeshData.features) {
    return false;
  }
  console.log(popmeshData)
  return popmeshData.features.some((feature) => feature.properties?.MESH_ID === meshid);
};
