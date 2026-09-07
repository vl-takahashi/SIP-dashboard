/**
 * GET /api/diagnosis-list
 *
 * 受け取った診断結果の一覧を返すエンドポイント
 * ポーリング用
 */

// グローバルストレージ（複数インスタンス間で共有）
if (!global.diagnosisStore) {
  global.diagnosisStore = new Map();
}

export default async function handler(req, res) {
  // CORS ヘッダー設定
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Session-ID, X-Tenant-ID'
  );
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // sessionId でフィルタ（指定されている場合）
      const sessionId = req.headers['x-session-id'] || req.query.sessionId;

      let diagnosisList = Array.from(global.diagnosisStore.values());

      // sessionId が指定されている場合、そのセッションのデータのみ返す
      if (sessionId) {
        diagnosisList = diagnosisList.filter((d) => d.sessionId === sessionId);
      }

      // 新しい順にソート
      diagnosisList.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      console.log(
        `[${new Date().toISOString()}] 📋 診断結果一覧を取得: ${diagnosisList.length}件`
      );

      return res.status(200).json({
        success: true,
        data: diagnosisList,
        count: diagnosisList.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] ❌ 取得エラー:`,
        error.message
      );
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
