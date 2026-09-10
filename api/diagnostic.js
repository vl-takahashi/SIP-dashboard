/**
 * ダッシュボード Vercel Serverless Function: 診断モジュール呼び出し
 * FormData をストリームから読み込み、ECS に転送
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
    // ECS バックエンド URL（HTTP）
    const ecsBaseUrl = process.env.ECS_BACKEND_URL || 'http://52.62.35.205:5000';
    const endpoint = req.query.endpoint || 'chronogical_impact';
    const url = `${ecsBaseUrl}/${endpoint}`;

    console.log(`[Diagnostic Proxy] Forwarding to: ${url}`);
    console.log(`[Diagnostic Proxy] Content-Type: ${req.headers['content-type']}`);

    // リクエストボディをそのまま ECS に転送（formData/JSON 両対応）
    const ecsResponse = await fetch(url, {
      method: 'POST',
      headers: {
        // Content-Type をそのまま転送
        'Content-Type': req.headers['content-type'] || 'application/octet-stream',
      },
      body: req.body, // Node.js Buffer または Stream をそのまま送信
    });

    if (!ecsResponse.ok) {
      console.error(`[Diagnostic Proxy] ECS Error: ${ecsResponse.status}`);
      const errorText = await ecsResponse.text();
      return res.status(ecsResponse.status).json({
        error: `ECS returned ${ecsResponse.status}`,
        details: errorText.substring(0, 200),
      });
    }

    // ECS からの応答を取得
    const result = await ecsResponse.json();

    console.log(`[Diagnostic Proxy] Success, received diagnostic results`);

    // クライアント（ダッシュボード）へ返す
    return res.status(200).json(result);
  } catch (error) {
    console.error('[Diagnostic Proxy] Error:', error.message);
    console.error('[Diagnostic Proxy] Stack:', error.stack);
    return res.status(500).json({
      error: 'Diagnostic proxy failed',
      message: error.message,
    });
  }
};
