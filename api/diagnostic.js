/**
 * ダッシュボード Vercel Serverless Function: 診断モジュール呼び出し
 * HTTPS(Vercel ダッシュボード) → HTTP(ECS バックエンド) への呼び出しをプロキシ
 * Mixed Content エラーを回避
 */

export default async (req, res) => {
  // CORS 設定
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('[Diagnostic Module] Request headers:', req.headers);
    console.log('[Diagnostic Module] req.body type:', typeof req.body);
    console.log('[Diagnostic Module] req.body keys:', req.body ? Object.keys(req.body) : 'null');

    // リクエスト本体を取得
    let payload = req.body;

    // req.body が null または undefined の場合、エラー
    if (!payload) {
      console.error('[Diagnostic Module] req.body is null/undefined');
      // フォールバック：Content-Type で判定
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/x-www-form-urlencoded')) {
        console.log('[Diagnostic Module] Received form-urlencoded data (unsupported)');
        return res.status(400).json({
          error: 'FormData is not directly supported. Please send JSON.',
          contentType: contentType,
        });
      }
      throw new Error('No request body received');
    }

    // req.body が文字列の場合、JSON パース
    if (typeof payload === 'string') {
      payload = JSON.parse(payload);
    }

    console.log('[Diagnostic Module] Payload structure:', {
      destination: payload.destination,
      rideonstop: payload.rideonstop,
      hour: payload.hour,
      frequency: payload.frequency,
      budget: payload.budget,
      keys: Object.keys(payload).slice(0, 10),
    });

    // ECS バックエンド URL（HTTP）
    // 環境変数から取得、なければハードコード
    const ecsBaseUrl = process.env.ECS_BACKEND_URL || 'http://52.62.35.205:5000';
    const endpoint = req.query.endpoint || 'chronogical_impact';
    const url = `${ecsBaseUrl}/${endpoint}`;

    console.log(`[Diagnostic Module] POST ${url}`);

    // ECS へ HTTP POST
    const ecsResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!ecsResponse.ok) {
      console.error(`[Diagnostic Module] ECS Error: ${ecsResponse.status} ${ecsResponse.statusText}`);
      return res.status(ecsResponse.status).json({
        error: `ECS returned ${ecsResponse.status}`,
        details: ecsResponse.statusText,
      });
    }

    // ECS からの応答を取得
    const result = await ecsResponse.json();

    console.log(`[Diagnostic Module] Success: ${Object.keys(result).length} keys returned`);
    console.log('[Diagnostic Module] Result:', {
      pointiness: result.pointiness,
      redundancy: result.redundancy,
      lifestyle: result.lifestyle,
      economic: result.economic,
    });

    // クライアント（ダッシュボード）へ返す
    return res.status(200).json(result);
  } catch (error) {
    console.error('[Diagnostic Module] Error:', error.message);
    return res.status(500).json({
      error: 'Diagnostic request failed',
      message: error.message,
    });
  }
};
