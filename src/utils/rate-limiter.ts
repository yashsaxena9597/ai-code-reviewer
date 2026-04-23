import { getRedisClient } from '../cache/redis';
import logger from './logger';

export class RateLimiter {
  private prefix: string;
  private maxRequests: number;
  private windowSeconds: number;

  constructor(prefix: string, maxRequests: number, windowSeconds: number) {
    this.prefix = prefix;
    this.maxRequests = maxRequests;
    this.windowSeconds = windowSeconds;
  }

  async isAllowed(key: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const redisKey = `${this.prefix}:${key}`;
      const current = await redis.incr(redisKey);

      if (current === 1) {
        await redis.expire(redisKey, this.windowSeconds);
      }

      if (current > this.maxRequests) {
        logger.warn(`Rate limit exceeded for ${key}`, {
          current,
          max: this.maxRequests,
        });
        return false;
      }

      return true;
    } catch {
      // If Redis is down, allow the request
      return true;
    }
  }

  async getRemainingRequests(key: string): Promise<number> {
    try {
      const redis = getRedisClient();
      const current = await redis.get(`${this.prefix}:${key}`);
      return Math.max(0, this.maxRequests - (parseInt(current || '0', 10)));
    } catch {
      return this.maxRequests;
    }
  }
}

// Default rate limiter for AI API calls: 60 requests per minute
export const aiRateLimiter = new RateLimiter('ai-rate', 60, 60);
