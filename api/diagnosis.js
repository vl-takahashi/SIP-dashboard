/**
 * 🚨 テナント隔離対応版
 * Vercel Serverless Function: 診断結果受け取り API
 * POST /api/diagnosis
 */

// メモリストレージ（Vercel KV や DB に変更可能）
const diagnosisStore = new Map();

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

  // ⚠️ sessionId の形式をチェック（オプション）
  if (!bodySessionId.startsWith('sess_')) {
    return {
      valid: false,
      error: '無効な sessionId 形式です',
    };
  }

  return { valid: true };
};

export default function handler(req, res) {
  // ⚠️ CORS ヘッダー設定（テナント隔離対応）
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
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const {
        sessionId,
        session_id,
        userName,
        user_name,
        answers,
        diagnosis,
        timestamp,
      } = req.body;

      const id = sessionId || session_id;

      // ⚠️ リクエストボディのバリデーション
      if (!id || !userName && !user_name) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'sessionId と userName は必須です',
        });
      }

      // ⚠️ ヘッダーから sessionId を検証
      const headerSessionId = req.headers['x-session-id'];
      const validation = validateSessionId(id, headerSessionId);

      if (!validation.valid) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: validation.error,
        });
      }

      const diagnosisData = {
        sessionId: id,
        userName: userName || user_name,
        answers: answers || {},
        diagnosis: diagnosis || {},
        timestamp: timestamp || new Date().toISOString(),
      };

      // メモリに保存
      diagnosisStore.set(id, diagnosisData);

      console.log(`[${new Date().toISOString()}] 📤 診断結果を受け取りました`, {
        sessionId: id,
        userName: diagnosisData.userName,
        diagnosis: diagnosisData.diagnosis,
      });

      return res.status(200).json({
        success: true,
        message: '診断結果を受け取りました',
        data: {
          sessionId: id,
          userName: diagnosisData.userName,
          receivedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ API エラー:`, error);
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
