/**
 * POST /api/diagnosis
 * 診断結果をコンソールにログ出力（デバッグ用）
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

    console.log(`[${new Date().toISOString()}] ✅ 診断結果を受け取りました`, {
      sessionId,
      userName,
      diagnosis,
    });

    return res.status(200).json({
      success: true,
      message: '診断結果を受け取りました',
      data: {
        sessionId,
        userName,
        receivedAt: new Date().toISOString(),
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
