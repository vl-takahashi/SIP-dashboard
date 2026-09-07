/**
 * POST /api/transit-data - transit-data（ridingtime_direct_dest等）を Vercel KV に保存
 * GET /api/transit-data?sessionId=xxx - transit-data を取得
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

  // POST: transit-data を保存
  if (req.method === 'POST') {
    try {
      const { sessionId, transitData } = req.body;

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

      // transit-data を構築
      const data = {
        sessionId,
        transitData, // property=ridingtime_direct_dest のJSONをそのまま保存
        timestamp: new Date().toISOString(),
      };

      // 📝 Redis に保存
      const client = await getRedisClient();

      if (client) {
        try {
          const kvKey = `transit-data:${sessionId}`;
          await client.setEx(
            kvKey,
            86400 * 7, // 7日間保持
            JSON.stringify(data)
          );
          console.log(`✅ transit-data を Redis に保存: ${kvKey}`);
        } catch (redisError) {
          console.warn('⚠️ Redis 保存エラー:', redisError.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'transit-data を受け取りました',
        data: {
          sessionId,
          timestamp: data.timestamp,
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

  // GET: transit-data を取得
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

      const kvKey = `transit-data:${id}`;
      const rawData = await client.get(kvKey);

      if (!rawData) {
        console.log(`⚠️ transit-data が見つかりません: ${kvKey}`);
        return res.status(200).json({
          transitData: null,
        });
      }

      const data = JSON.parse(rawData);
      console.log(`✅ transit-data を取得: ${kvKey}`);

      return res.status(200).json(data);
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
