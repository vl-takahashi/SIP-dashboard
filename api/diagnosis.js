/**
 * POST /api/diagnosis
 * 診断結果を Vercel KV REST API に保存
 */

export default async function handler(req, res) {
  // CORS ヘッダー設定
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Session-ID, X-Tenant-ID, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
    });
  }

  try {
    const { sessionId, userName, answers, diagnosis } = req.body;

    if (!sessionId || !userName) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'sessionId and userName are required',
      });
    }

    const headerSessionId = req.headers['x-session-id'];

    if (sessionId !== headerSessionId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Session ID mismatch',
      });
    }

    // 診断結果を構築
    const diagnosisData = {
      sessionId,
      userName,
      answers,
      diagnosis,
      timestamp: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    };

    // 📊 Vercel KV REST API に保存
    const kvRestApiUrl = process.env.KV_REST_API_URL;
    const kvRestApiToken = process.env.KV_REST_API_TOKEN;

    if (!kvRestApiUrl || !kvRestApiToken) {
      console.warn('⚠️ KV REST API の環境変数が設定されていません');
      // 環境変数がない場合はログのみ出力
      console.log(`✅ 診断結果（メモリに保存）:`, diagnosisData);

      return res.status(200).json({
        success: true,
        message: '診断結果を受け取りました',
        data: {
          sessionId,
          userName,
          receivedAt: diagnosisData.receivedAt,
        },
      });
    }

    try {
      // KV に保存：キー = `session:${sessionId}:latest`
      const kvKey = `session:${sessionId}:latest`;
      const kvSetUrl = `${kvRestApiUrl}/set/${kvKey}`;

      const kvResponse = await fetch(kvSetUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvRestApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...diagnosisData,
          ex: 86400 * 7, // 7日間保持
        }),
      });

      if (!kvResponse.ok) {
        console.warn(`⚠️ KV 保存エラー: ${kvResponse.status}`);
      } else {
        console.log(`✅ 診断結果を KV に保存: ${kvKey}`);
      }
    } catch (kvError) {
      console.warn('⚠️ KV 保存処理中にエラー:', kvError.message);
    }

    return res.status(200).json({
      success: true,
      message: '診断結果を受け取りました',
      data: {
        sessionId,
        userName,
        receivedAt: diagnosisData.receivedAt,
      },
    });
  } catch (error) {
    console.error(`❌ API エラー:`, error.message);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
}
