import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { redisConfig } from 'src/config/database.config';

@Injectable()
export class RedisService {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    if (redisConfig.useRedis) {
      this.client = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
        tls: {}, // Upstash บังคับใช้ SSL
        connectTimeout: 10000,
        retryStrategy: (times) => Math.min(times * 2000, 10000),
      });

      this.client.on('connect', () => {
        this.logger.log('✅ Connected to Redis successfully!');
      });

      this.client.on('error', (err) => {
        this.logger.error('❌ Redis connection error:', err.message);
      });
    } else {
      this.logger.warn('⚠️ Redis not enabled (USE_REDIS=false)');
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) {
      this.logger.error('❌ Redis client is not initialized');
      throw new Error('Redis not available');
    }

    try {
      return await this.client.get(key);
    } catch (err) {
      this.logger.error('❌ Redis GET error:', err.message);
      return null;
    }
  }

  async set(key: string, value: string, expireSeconds = 300): Promise<void> {
    if (!this.client) {
      this.logger.error('❌ Redis client is not initialized');
      throw new Error('Redis not available');
    }

    try {
      await this.client.set(key, value, 'EX', expireSeconds);
      this.logger.log(`✅ Redis SET success key=${key}`);
    } catch (err) {
      this.logger.error('❌ Redis SET error:', err.message);
    }
  }

  async addViewedBook(ip: string, bookId: string): Promise<void> {
    const key = `viewed_books:${ip}`;
    await this.client.sadd(key, bookId);
  }
  
  async getViewedBooks(ip: string): Promise<string[]> {
    const key = `viewed_books:${ip}`;
    const books = await this.client.smembers(key);
    return books || [];
  }
  
}
