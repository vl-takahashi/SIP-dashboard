/**
 * 往路と復路のデータから往復ペアを算出
 * ダッシュボードで使用
 */

function timeToSeconds(timeStr) {
  const [h, m, s] = timeStr.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

function secondsToTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const sec = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function calculateRoundtripPairs(outboundData, inboundData) {
  const outboundByMesh = {};

  outboundData.data.forEach(conditionData => {
    const condition = conditionData.condition;
    const hour = condition.hour;
    const weekday = condition.weekday;

    conditionData.data.forEach(item => {
      const meshids = item.directmeshid;
      const rideontime = item.directrideontime;
      const rideontimeSec = timeToSeconds(rideontime);

      meshids.forEach(meshid => {
        if (!outboundByMesh[meshid]) {
          outboundByMesh[meshid] = [];
        }
        outboundByMesh[meshid].push({
          hour,
          weekday,
          rideontime,
          rideontimeSec,
          stop: item.directgetoffstop,
          route: item.directroute,
          agency: item.directagency
        });
      });
    });
  });

  const inboundByMesh = {};

  inboundData.data.forEach(conditionData => {
    const condition = conditionData.condition;
    const hour = condition.hour;
    const weekday = condition.weekday;

    conditionData.data.forEach(item => {
      const meshids = item.directmeshid;
      const rideontime = item.directrideontime;
      const rideontimeSec = timeToSeconds(rideontime);

      meshids.forEach(meshid => {
        if (!inboundByMesh[meshid]) {
          inboundByMesh[meshid] = [];
        }
        inboundByMesh[meshid].push({
          hour,
          weekday,
          rideontime,
          rideontimeSec,
          stop: item.directrideonstop,
          route: item.directroute,
          agency: item.directagency
        });
      });
    });
  });

  const roundtripPairs = [];

  Object.keys(outboundByMesh).forEach(meshid => {
    if (!inboundByMesh[meshid]) return;

    const outboundList = outboundByMesh[meshid];
    const inboundList = inboundByMesh[meshid];

    outboundList.forEach(out => {
      inboundList.forEach(inb => {
        if (out.weekday === inb.weekday) {
          let timeDiff = inb.rideontimeSec - out.rideontimeSec;
          if (timeDiff < 0) {
            timeDiff += 86400;
          }

          roundtripPairs.push({
            meshid,
            outbound: {
              hour: out.hour,
              rideontime: out.rideontime,
              stop: out.stop,
              route: out.route,
              agency: out.agency
            },
            inbound: {
              hour: inb.hour,
              rideontime: inb.rideontime,
              stop: inb.stop,
              route: inb.route,
              agency: inb.agency
            },
            timeDiffSeconds: timeDiff,
            timeDiffHms: secondsToTime(timeDiff),
            weekday: out.weekday
          });
        }
      });
    });
  });

  return roundtripPairs;
}

function generateRoundtripSummary(pairs) {
  if (pairs.length === 0) {
    return {
      totalPairs: 0,
      uniqueMeshids: 0,
      timeDiffStats: { min: 0, max: 0, avg: 0 }
    };
  }

  const timeDiffs = pairs.map(p => p.timeDiffSeconds);
  const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;

  return {
    totalPairs: pairs.length,
    uniqueMeshids: new Set(pairs.map(p => p.meshid)).size,
    timeDiffStats: {
      min: Math.min(...timeDiffs),
      max: Math.max(...timeDiffs),
      avg: Math.floor(avgTimeDiff)
    }
  };
}

export {
  calculateRoundtripPairs,
  generateRoundtripSummary,
  timeToSeconds,
  secondsToTime
};
