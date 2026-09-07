/**
 * POST /api/save-diagnosis
 *
 * 診断結果を Vercel KV に保存
 * チャットボット側から呼び出される
 */

import { kv } from '@vercel/kv';

/**
 * sessionId バリデーション
 */
const validateSessionId = (bodySessionId, headerSessionId) => {
  if (!bodySessionId || !headerSessionId) {
    return {
      valid: false,
      error: 'sessionId が提供されていません',
    };
  }

  if (bodySessionId !== headerSessionId) {
    return {
      valid: false,
      error: 'ボディとヘッダーの sessionId が一致しません',
    };
  }

  if (!bodySessionId.startsWith('sess_')) {
    return {
      valid: false,
      error: '無効な sessionId 形式です',
    };
  }

  return { valid: true };
};

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

  if (req.method === 'POST') {
    try {
      const {
        sessionId,
        session_id,
        userId,
        userName,
        user_name,
        answers,
        diagnosis,
        timestamp,
      } = req.body;

      const id = sessionId || session_id;

      // リクエストボディのバリデーション
      if (!id || (!userName && !user_name)) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'sessionId と userName は必須です',
        });
      }

      // ヘッダーから sessionId を検証
      const headerSessionId = req.headers['x-session-id'];
      const validation = validateSessionId(id, headerSessionId);

      if (!validation.valid) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: validation.error,
        });
      }

      // 診断結果を構築
      const diagnosisData = {
        sessionId: id,
        userId: userId || `user_${Date.now()}`,
        userName: userName || user_name,
        answers: answers || {},
        diagnosis: diagnosis || {},
        timestamp: timestamp || new Date().toISOString(),
        receivedAt: new Date().toISOString(),
      };

      // Vercel KV に保存
      // キー形式: diagnosis:{sessionId}:{timestamp}
      const kvKey = `diagnosis:${id}:${Date.now()}`;
      await kv.set(kvKey, JSON.stringify(diagnosisData), { ex: 86400 * 7 }); // 7日間保持

      // セッション用のリスト也を保存（最新の診断結果を簡単に取得するため）
      const sessionKey = `session:${id}:latest`;
      await kv.set(sessionKey, JSON.stringify(diagnosisData), { ex: 86400 * 7 });

      console.log(
        `[${new Date().toISOString()}] 📤 診断結果を KV に保存しました`,
        {
          sessionId: id,
          userName: diagnosisData.userName,
          kvKey,
        }
      );

      return res.status(200).json({
        success: true,
        message: '診断結果を保存しました',
        data: {
          sessionId: id,
          userName: diagnosisData.userName,
          receivedAt: diagnosisData.receivedAt,
          kvKey,
        },
      });
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] ❌ API エラー:`,
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
