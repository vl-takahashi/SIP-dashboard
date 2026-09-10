/**
 * Vercel API ルート: 診断モジュール呼び出し
 * formdata をそのまま ECS に転送（シンプル版）
 */

export default async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const ecsBaseUrl = 'http://52.62.35.205:5000';
    const endpoint = req.query.endpoint || 'chronogical_impact';
    const url = `${ecsBaseUrl}/${endpoint}`;

    console.log(`[Diagnostic] Forwarding to: ${url}`);
    console.log(`[Diagnostic] Method: ${req.method}`);
    console.log(`[Diagnostic] Content-Type: ${req.headers['content-type']}`);

    // リクエスト本体をそのまま ECS に転送
    const ecsResponse = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/octet-stream',
      },
      body: req.body,
    });

    if (!ecsResponse.ok) {
      console.error(`[Diagnostic] ECS Error: ${ecsResponse.status}`);
      const errorText = await ecsResponse.text();
      return res.status(ecsResponse.status).json({
        error: `ECS returned ${ecsResponse.status}`,
        details: errorText.substring(0, 200),
      });
    }

    const result = await ecsResponse.json();
    console.log(`[Diagnostic] Success`);

    return res.status(200).json(result);
  } catch (error) {
    console.error('[Diagnostic] Error:', error.message);
    return res.status(500).json({
      error: 'Diagnostic failed',
      message: error.message,
    });
  }
};
