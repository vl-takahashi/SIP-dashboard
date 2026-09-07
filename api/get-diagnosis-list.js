/**
 * GET /api/get-diagnosis-list
 * Vercel KV (Redis) から診断結果を取得
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Session-ID, X-Tenant-ID'
  );
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
    });
  }

  try {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'sessionId is required',
      });
    }

    // 📊 Redis から取得
    const client = await getRedisClient();

    if (!client) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        message: 'Redis not configured',
      });
    }

    try {
      const kvKey = `session:${sessionId}:latest`;
      const data = await client.get(kvKey);

      if (!data) {
        return res.status(200).json({
          success: true,
          data: [],
          count: 0,
        });
      }

      const diagnosisData = JSON.parse(data);

      console.log(`✅ 診断結果を Redis から取得: ${kvKey}`);

      return res.status(200).json({
        success: true,
        data: [diagnosisData],
        count: 1,
        timestamp: new Date().toISOString(),
      });
    } catch (redisError) {
      console.warn('⚠️ Redis 取得エラー:', redisError.message);
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
      });
    }
  } catch (error) {
    console.error(`❌ API エラー:`, error.message);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
}
