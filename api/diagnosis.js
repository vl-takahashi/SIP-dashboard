/**
 * Vercel Serverless Function: 診断結果受け取り API
 * POST /api/diagnosis
 */

// メモリストレージ（Vercel KV や DB に変更可能）
const diagnosisStore = new Map();

export default function handler(req, res) {
  // CORS ヘッダー設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
      const diagnosisData = {
        sessionId: id,
        userName: userName || user_name,
        answers: answers || {},
        diagnosis: diagnosis || {},
        timestamp: timestamp || new Date().toISOString(),
      };

      // メモリに保存
      diagnosisStore.set(id, diagnosisData);

      console.log('📊 診断結果を受け取りました:', {
        sessionId: id,
        userName: diagnosisData.userName,
        diagnosis: diagnosisData.diagnosis,
      });

      return res.status(200).json({
        success: true,
        message: '診断結果を受け取りました',
        sessionId: id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ エラー:', error.message);
      return res.status(400).json({
        success: false,
        message: `エラー: ${error.message}`,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
