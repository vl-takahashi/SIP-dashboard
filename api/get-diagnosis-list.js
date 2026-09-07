/**
 * GET /api/get-diagnosis-list
 *
 * Vercel KV から診断結果の一覧を取得
 * ダッシュボード側がポーリングで使用
 */

import { kv } from '@vercel/kv';

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

      let diagnosisList = [];

      if (sessionId) {
        // 指定セッションの最新診断結果を取得
        const sessionKey = `session:${sessionId}:latest`;
        const data = await kv.get(sessionKey);

        if (data) {
          diagnosisList = [JSON.parse(data)];
        }
      } else {
        // すべてのセッションの最新診断結果を取得
        // ※ Vercel KV には scan コマンドが制限されているため、
        // この実装は簡略版です。本番環境では別の方法を検討してください。
        console.warn(
          'sessionId が指定されていません。全セッション取得は推奨されません。'
        );
      }

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
