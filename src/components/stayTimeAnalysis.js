/**
 * 往路到着時刻からメッシュごとの最大滞在時間を算出
 */

function timeToSeconds(timeStr) {
  const [h, m, s] = timeStr.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

function secondsToTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function calculateMaxStayTime(enrichedPairs, selectedOutboundHour, selectedOutboundTime) {
  const selectedSecond = timeToSeconds(selectedOutboundTime);
  const meshStayTimes = {};

  enrichedPairs.forEach(pair => {
    if (pair.outbound.hour === selectedOutboundHour) {
      const outboundSecond = timeToSeconds(pair.outbound.rideontime);

      const timeDiff = Math.abs(outboundSecond - selectedSecond);
      if (timeDiff > 1800) return;

      const inboundSecond = timeToSeconds(pair.inbound.rideontime);
      let staySeconds = inboundSecond - outboundSecond;

      if (staySeconds < 0) {
        staySeconds += 86400;
      }

      if (!meshStayTimes[pair.meshid]) {
        meshStayTimes[pair.meshid] = {
          meshId: pair.meshid,
          maxStaySeconds: 0,
          maxStayHms: '00:00:00',
          population: pair.population?.total2025 || 0,
          pairs: []
        };
      }

      if (staySeconds > meshStayTimes[pair.meshid].maxStaySeconds) {
        meshStayTimes[pair.meshid].maxStaySeconds = staySeconds;
        meshStayTimes[pair.meshid].maxStayHms = secondsToTime(staySeconds);
      }

      meshStayTimes[pair.meshid].pairs.push({
        outboundTime: pair.outbound.rideontime,
        inboundTime: pair.inbound.rideontime,
        staySeconds,
        stayHms: secondsToTime(staySeconds)
      });
    }
  });

  return meshStayTimes;
}

function generateStayTimeGeoJSON(meshStayTimes, populationData) {
  const features = [];

  if (populationData.data && populationData.data.features) {
    populationData.data.features.forEach(feature => {
      const meshId = feature.properties.MESH_ID;
      const stayInfo = meshStayTimes[meshId];

      if (stayInfo) {
        features.push({
          ...feature,
          properties: {
            ...feature.properties,
            maxStaySeconds: stayInfo.maxStaySeconds,
            maxStayHms: stayInfo.maxStayHms,
            population: stayInfo.population
          }
        });
      }
    });
  }

  return {
    type: 'FeatureCollection',
    features
  };
}

function generateStayTimeMapLayer(geoJSON) {
  return {
    id: 'staytime-layer',
    type: 'fill',
    sourceData: geoJSON,
    paint: {
      'fill-color': [
        'case',
        // 1時間未満は透明
        ['<', ['get', 'maxStaySeconds'], 3600],
        'rgba(0, 0, 0, 0)',
        // 1時間以上は色分け（赤→黄→青緑）
        ['>=', ['get', 'maxStaySeconds'], 3600],
        [
          'rgb',
          // R = max(0, min(255, maxStaySeconds/3600 * 21.25))
          ['max', 0, ['min', 255, ['*', ['/', ['to-number', ['get', 'maxStaySeconds']], 3600], 21.25]]],
          // G = 常に255
          255,
          // B = max(0, min(255, 255 - maxStaySeconds/3600 * 21.25))
          ['max', 0, ['min', 255, ['-', 255, ['*', ['/', ['to-number', ['get', 'maxStaySeconds']], 3600], 21.25]]]]
        ],
        'rgba(0, 0, 0, 0)'
      ],
      'fill-opacity': [
        'case',
        ['<', ['get', 'maxStaySeconds'], 3600],
        0,
        1
      ]
    },
    layout: {},
    hoverType: '最大滞在時間'
  };
}

function generateStayTimeReport(meshStayTimes) {
  const stayTimes = Object.values(meshStayTimes)
    .filter(m => m.maxStaySeconds > 0)
    .map(m => m.maxStaySeconds);

  if (stayTimes.length === 0) {
    return { error: '滞在時間データがありません' };
  }

  const avgStay = stayTimes.reduce((a, b) => a + b, 0) / stayTimes.length;
  const minStay = Math.min(...stayTimes);
  const maxStay = Math.max(...stayTimes);

  const distribution = {
    '0-2h': stayTimes.filter(s => s < 7200).length,
    '2-4h': stayTimes.filter(s => s >= 7200 && s < 14400).length,
    '4-8h': stayTimes.filter(s => s >= 14400 && s < 28800).length,
    '8-12h': stayTimes.filter(s => s >= 28800 && s < 43200).length,
    '12h+': stayTimes.filter(s => s >= 43200).length
  };

  return {
    totalMeshes: Object.keys(meshStayTimes).length,
    meshesWithStay: stayTimes.length,
    avgStayTime: secondsToTime(Math.round(avgStay)),
    minStayTime: secondsToTime(minStay),
    maxStayTime: secondsToTime(maxStay),
    distribution
  };
}

export {
  calculateMaxStayTime,
  generateStayTimeGeoJSON,
  generateStayTimeMapLayer,
  generateStayTimeReport,
  timeToSeconds,
  secondsToTime
};
