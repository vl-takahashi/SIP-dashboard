/**
 * POST /api/diagnosis
 * 診断結果を Vercel KV (Redis) に保存
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

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
    });
  }

  try {
    const { sessionId, userName, answers, diagnosis } = req.body;

    if (!sessionId || !userName) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'sessionId and userName are required',
      });
    }

    const headerSessionId = req.headers['x-session-id'];

    if (sessionId !== headerSessionId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Session ID mismatch',
      });
    }

    // 診断結果を構築
    const diagnosisData = {
      sessionId,
      userName,
      answers,
      diagnosis,
      timestamp: new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    };

    // 📊 Redis に保存
    const client = await getRedisClient();

    if (client) {
      try {
        const kvKey = `session:${sessionId}:latest`;
        await client.setEx(
          kvKey,
          86400 * 7, // 7日間保持
          JSON.stringify(diagnosisData)
        );
        console.log(`✅ 診断結果を Redis に保存: ${kvKey}`);
      } catch (redisError) {
        console.warn('⚠️ Redis 保存エラー:', redisError.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: '診断結果を受け取りました',
      data: {
        sessionId,
        userName,
        receivedAt: diagnosisData.receivedAt,
      },
    });
  } catch (error) {
    console.error(`❌ API エラー:`, error.message);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
}
