/**
 * POST /api/questions - Q1/Q2/Q3 データを保存
 * GET /api/questions?sessionId=xxx - Q1/Q2/Q3 データを取得
 * Vercel KV (Redis) に保存・取得
 */

import { createClient } from 'redis';

let redisClient = null;

async function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('⚠️ REDIS_URL environment variable is not set');
    return null;
  }

  try {
    redisClient = createClient({ url: redisUrl });
    redisClient.on('error', (err) =>
      console.log('Redis Client Error', err)
    );
    await redisClient.connect();
    console.log('✅ Redis connected');
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    return null;
  }
}

export default async function handler(req, res) {
  // ✅ キャッシュ無効化（常に最新データを返す）
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

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

  // POST: Q1/Q2/Q3 データを保存
  if (req.method === 'POST') {
    try {
      const { sessionId, q1_destination, q2_latitude, q2_longitude, q3_arrival_time, address } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'sessionId is required',
        });
      }

      const headerSessionId = req.headers['x-session-id'];

      if (sessionId !== headerSessionId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Session ID mismatch',
        });
      }

      // Q1/Q2/Q3 データを構築
      const newQuestion = {
        sessionId,
        q1_destination,
        q2_latitude,
        q2_longitude,
        q3_arrival_time,
        address,
        timestamp: new Date().toISOString(),
      };

      // 📝 Redis に保存（配列で蓄積）
      const client = await getRedisClient();

      if (client) {
        try {
          const kvKey = `questions:${sessionId}`;

          // ✅ 既存データを取得
          const existingData = await client.get(kvKey);
          let questionsList = [];

          if (existingData) {
            try {
              questionsList = JSON.parse(existingData);
              if (!Array.isArray(questionsList)) {
                questionsList = [questionsList]; // 古い単一オブジェクトを配列に変換
              }
            } catch (e) {
              questionsList = [];
            }
          }

          // ✅ 重複チェック（同じ座標が既に存在するか）
          const isDuplicate = questionsList.some(q =>
            q.q2_latitude === q2_latitude && q.q2_longitude === q2_longitude
          );

          if (!isDuplicate) {
            // ✅ 新しいデータを配列に追加
            questionsList.push(newQuestion);
            console.log(`✅ 新しい座標を追加: [${q2_latitude}, ${q2_longitude}]`);
          } else {
            console.log(`⚠️ 重複座標：追加しません [${q2_latitude}, ${q2_longitude}]`);
          }

          // ✅ 配列全体を保存
          await client.setEx(
            kvKey,
            86400 * 7, // 7日間保持
            JSON.stringify(questionsList)
          );
          console.log(`✅ Q1/Q2/Q3 データを Redis に保存: ${kvKey} (全 ${questionsList.length} 件)`);
        } catch (redisError) {
          console.warn('⚠️ Redis 保存エラー:', redisError.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Q1/Q2/Q3 データを受け取りました',
        data: {
          sessionId,
          timestamp: newQuestion.timestamp,
        },
      });
    } catch (error) {
      console.error(`❌ POST エラー:`, error.message);

      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
      });
    }
  }

  // GET: Q1/Q2/Q3 データを取得
  if (req.method === 'GET') {
    try {
      const { sessionId } = req.query;
      const headerSessionId = req.headers['x-session-id'];

      const id = sessionId || headerSessionId;

      if (!id) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'sessionId is required',
        });
      }

      // 📖 Redis から取得
      const client = await getRedisClient();

      if (!client) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: 'Redis connection failed',
        });
      }

      const kvKey = `questions:${id}`;
      const data = await client.get(kvKey);

      if (!data) {
        console.log(`⚠️ Q1/Q2/Q3 データが見つかりません: ${kvKey}`);
        return res.status(200).json({
          questionsList: [],
          latest: {
            q1_destination: null,
            q2_latitude: null,
            q2_longitude: null,
            q3_arrival_time: null,
            address: null,
          }
        });
      }

      let questionsData = JSON.parse(data);

      // ✅ 配列と単一オブジェクトの両方に対応
      let questionsList = [];
      let latest = null;

      if (Array.isArray(questionsData)) {
        questionsList = questionsData;
        latest = questionsData[questionsData.length - 1] || null; // 最新データ
      } else {
        questionsList = [questionsData]; // 古い形式なら配列に変換
        latest = questionsData;
      }

      console.log(`✅ Q1/Q2/Q3 データを取得: ${kvKey} (全 ${questionsList.length} 件)`);
      console.log(`🔴 【GET】latest:`, latest);
      console.log(`📋 【GET】questionsList[0]:`, questionsList[0]);

      return res.status(200).json({
        questionsList,
        latest
      });
    } catch (error) {
      console.error(`❌ GET エラー:`, error.message);

      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message,
      });
    }
  }

  return res.status(405).json({
    error: 'Method Not Allowed',
  });
}
