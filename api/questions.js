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
      const questionsData = {
        sessionId,
        q1_destination,
        q2_latitude,
        q2_longitude,
        q3_arrival_time,
        address,
        timestamp: new Date().toISOString(),
      };

      // 📝 Redis に保存
      const client = await getRedisClient();

      if (client) {
        try {
          const kvKey = `questions:${sessionId}`;
          await client.setEx(
            kvKey,
            86400 * 7, // 7日間保持
            JSON.stringify(questionsData)
          );
          console.log(`✅ Q1/Q2/Q3 データを Redis に保存: ${kvKey}`);
        } catch (redisError) {
          console.warn('⚠️ Redis 保存エラー:', redisError.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Q1/Q2/Q3 データを受け取りました',
        data: {
          sessionId,
          timestamp: questionsData.timestamp,
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
          q1_destination: null,
          q2_latitude: null,
          q2_longitude: null,
          q3_arrival_time: null,
          address: null,
        });
      }

      const questionsData = JSON.parse(data);
      console.log(`✅ Q1/Q2/Q3 データを取得: ${kvKey}`);

      return res.status(200).json(questionsData);
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
