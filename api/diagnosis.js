/**
 * 🚨 テナント隔離対応版 + Vercel KV 対応
 * POST /api/diagnosis
 *
 * 診断結果を Vercel KV に保存
 * チャットボット側から呼び出される
 */

import { kv } from '@vercel/kv';

/**
 * CORS ヘッダー設定
 */
const setCorsHeaders = (res) => {
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
};

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

/**
 * メインハンドラ
 */
export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'POST メソッドのみ対応しています',
    });
  }

  try {
    const {
      sessionId,
      userId,
      userName,
      answers,
      diagnosis,
      createdAt,
      timestamp,
    } = req.body;

    if (!sessionId || !userName || !answers) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'sessionId, userName, answers は必須です',
      });
    }

    const headerSessionId = req.headers['x-session-id'];
    const validation = validateSessionId(sessionId, headerSessionId);

    if (!validation.valid) {
      return res.status(403).json({
        error: 'Forbidden',
        message: validation.error,
      });
    }

    const diagnosisData = {
      sessionId,
      userId: userId || `user_${Date.now()}`,
      userName,
      answers,
      diagnosis,
      timestamp: timestamp || new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    };

    // 📊 Vercel KV に保存
    const kvKey = `diagnosis:${sessionId}:${Date.now()}`;
    await kv.set(kvKey, JSON.stringify(diagnosisData), { ex: 86400 * 7 });

    // 📍 セッション用のキーを保存
    const sessionKey = `session:${sessionId}:latest`;
    await kv.set(sessionKey, JSON.stringify(diagnosisData), { ex: 86400 * 7 });

    console.log(
      `[${new Date().toISOString()}] 📤 診断結果を KV に保存しました`,
      {
        sessionId,
        userName,
        kvKey,
      }
    );

    return res.status(200).json({
      success: true,
      message: '診断結果を受け取りました',
      data: {
        sessionId,
        userId: diagnosisData.userId,
        userName,
        receivedAt: diagnosisData.receivedAt,
      },
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ API エラー:`, error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
}
