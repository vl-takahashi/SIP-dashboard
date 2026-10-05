/**
 * 時間帯別のルート情報から、アクセシビリティマトリックスを構築
 * 複数のJSONデータをマージして統一形式に整形
 */

/**
 * 時間帯を分類する
 * @param {number} hour - 時間（0-23）
 * @returns {string} 時間帯キー '06-09', '09-18', '18-22', '22-06'
 */
export const classifyTimeSlot = (hour) => {
  if (hour >= 6 && hour < 9) return '06-09';
  if (hour >= 9 && hour < 18) return '09-18';
  if (hour >= 18 && hour < 22) return '18-22';
  return '22-06'; // 22-06時
};

/**
 * アクセシビリティアイコンを決定
 * @param {number} ridingTime - 乗車時間（秒）
 * @returns {string} '✅', '⚠️', or '❌'
 */
export const getAccessibilityIcon = (ridingTime) => {
  if (!ridingTime) return '❌';
  const minutes = ridingTime / 60;
  if (minutes <= 30) return '✅'; // 30分以内は利用可能
  if (minutes <= 60) return '⚠️'; // 30-60分は時間がかかる
  return '⚠️'; // 60分以上も⚠️
};

/**
 * マトリックスデータを構築
 * @param {Array} routeDataArray - JSON形式のルートデータ配列
 * @returns {Object} { matrix, destinations, score, busStop }
 */
export const buildAccessibilityMatrix = (routeDataArray) => {
  const matrix = {};
  const timeSlots = ['06-09', '09-18', '18-22', '22-06'];
  const destinations = new Set();

  // 各ファイルのデータを処理
  routeDataArray.forEach((jsonData) => {
    if (!jsonData.data || !Array.isArray(jsonData.data)) return;

    jsonData.data.forEach((record) => {
      const condition = record.condition || {};
      const destination = condition.to || '不明';
      const hour = condition.hour;
      const timeSlot = classifyTimeSlot(hour);

      destinations.add(destination);

      if (!matrix[destination]) {
        matrix[destination] = {};
      }

      // 複数の乗車停がある場合、最短時間を採用
      let minRidingTime = null;
      if (record.data && Array.isArray(record.data)) {
        record.data.forEach((route) => {
          if (!minRidingTime || route.directridingtime < minRidingTime) {
            minRidingTime = route.directridingtime;
          }
        });
      }

      // アイコンを決定
      const icon = getAccessibilityIcon(minRidingTime);

      // すでに同じ時間帯のデータがあれば、より良い（✅に近い）方を優先
      const currentIcon = matrix[destination][timeSlot];
      if (currentIcon && currentIcon === '✅') {
        // 既に✅ならそのまま
      } else if (currentIcon && currentIcon === '⚠️' && icon === '❌') {
        // ⚠️が確定しているなら❌で上書きしない
      } else {
        matrix[destination][timeSlot] = icon;
      }
    });
  });

  // 欠落時間帯に❌を埋める
  destinations.forEach((dest) => {
    timeSlots.forEach((slot) => {
      if (!matrix[dest][slot]) {
        matrix[dest][slot] = '❌'; // 運行なし
      }
    });
  });

  // アクセシビリティスコアを計算 (0-100)
  let totalCells = 0;
  let accessibleCells = 0;
  Object.values(matrix).forEach((row) => {
    Object.values(row).forEach((icon) => {
      totalCells++;
      if (icon === '✅') accessibleCells += 1;
      else if (icon === '⚠️') accessibleCells += 0.5;
    });
  });
  const score = totalCells > 0 ? Math.round((accessibleCells / totalCells) * 100) : 0;

  // 到達可能な目的地リスト
  const accessibleDestinations = Array.from(destinations).map((dest) => ({
    name: dest,
    timeSlots: Object.keys(matrix[dest]).filter((slot) => matrix[dest][slot] !== '❌'),
    travelTime: 'N/A', // 実装時に計算
    line: '複数',
  }));

  // 最寄りバス停（仮）
  const busStop = {
    name: '八本松駅',
    walk_time: 5,
    lat: 0,
    lon: 0,
  };

  return {
    matrix,
    destinations: accessibleDestinations,
    score,
    busStop,
  };
};

/**
 * 複数のJSONデータをマージ
 * @param {Object} dataMapping - { '目的地名': jsonData }
 * @returns {Object} 統合マトリックスデータ
 */
export const mergeMultipleRouteData = (dataMapping) => {
  const mergedArray = Object.values(dataMapping);
  return buildAccessibilityMatrix(mergedArray);
};
