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
    // リクエスト本体を取得（FormData または JSON）
    let payload = req.body;

    // req.body が文字列の場合、JSON パース
    if (typeof payload === 'string') {
      payload = JSON.parse(payload);
    }

    // FormData の場合、オブジェクトに変換
    if (payload instanceof FormData) {
      const formDataObj = {};
      for (const [key, value] of payload.entries()) {
        formDataObj[key] = value;
      }
      payload = formDataObj;
    }

    console.log('[Diagnostic Module] Received payload:', {
      destination: payload.destination,
      rideonstop: payload.rideonstop,
      hour: payload.hour,
      frequency: payload.frequency,
      budget: payload.budget,
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
