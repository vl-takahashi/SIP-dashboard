/**
 * GET /api/get-diagnosis-list
 * Vercel KV REST API から診断結果を取得
 */

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

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
    });
  }

  try {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'sessionId is required',
      });
    }

    // 📊 Vercel KV REST API から取得
    const kvRestApiUrl = process.env.KV_REST_API_URL;
    const kvRestApiToken = process.env.KV_REST_API_TOKEN;

    if (!kvRestApiUrl || !kvRestApiToken) {
      console.warn('⚠️ KV REST API の環境変数が設定されていません');
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        message: 'KV environment variables not configured',
      });
    }

    try {
      // KV から取得：キー = `session:${sessionId}:latest`
      const kvKey = `session:${sessionId}:latest`;
      const kvGetUrl = `${kvRestApiUrl}/get/${kvKey}`;

      const kvResponse = await fetch(kvGetUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${kvRestApiToken}`,
        },
      });

      if (!kvResponse.ok) {
        console.warn(`⚠️ KV 取得エラー: ${kvResponse.status}`);
        return res.status(200).json({
          success: true,
          data: [],
          count: 0,
        });
      }

      const kvData = await kvResponse.json();

      if (!kvData.result) {
        return res.status(200).json({
          success: true,
          data: [],
          count: 0,
        });
      }

      // KV から取得したデータをパース
      const diagnosisData = typeof kvData.result === 'string'
        ? JSON.parse(kvData.result)
        : kvData.result;

      console.log(`✅ 診断結果を KV から取得: ${kvKey}`);

      return res.status(200).json({
        success: true,
        data: [diagnosisData],
        count: 1,
        timestamp: new Date().toISOString(),
      });
    } catch (kvError) {
      console.warn('⚠️ KV 取得処理中にエラー:', kvError.message);
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
      });
    }
  } catch (error) {
    console.error(`❌ API エラー:`, error.message);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
}
