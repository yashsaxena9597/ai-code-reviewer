import Redis from 'ioredis';
import logger from '../utils/logger';

let client: Redis | null = null;

export function getRedisClient(url?: string): Redis {
  if (client) return client;

  client = new Redis(url || process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  client.on('error', (error) => {
    logger.error('Redis connection error', { error });
  });

  client.on('connect', () => {
    logger.info('Connected to Redis');
  });

  return client;
}

export async function cacheGet(key: string): Promise<string | null> {
  try {
    const redis = getRedisClient();
    return await redis.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: string,
  ttlSeconds = 3600,
): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.setex(key, ttlSeconds, value);
  } catch (error) {
    logger.warn('Failed to set cache', { key, error });
  }
}

export async function disconnectRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
