import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { redisConfig } from 'src/config/database.config';

@Injectable()
export class RedisService {
  private client: Redis | null = null;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    if (redisConfig.useRedis) {
      this.client = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
        tls: {},

        connectTimeout: 10000,
        retryStrategy: (times) => Math.min(times * 2000, 10000),
      });

      this.client.on('connect', () => {
        this.logger.log('✅ Redis connected');
      });

      this.client.on('error', (err) => {
        this.logger.error('❌ Redis connection error', err);
      });
    } else {
      this.logger.warn('⚠️ Redis not enabled (USE_REDIS=false)');
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) {
      this.logger.warn('⚠️ Redis client not available');
      return null;
    }
    try {
      const value = await this.client.get(key);
      this.logger.log(`🔎 GET ${key} = ${value}`);
      return value;
    } catch (error) {
      this.logger.error(`❌ Redis GET error: ${error.message}`);
      return null;
    }
  }

  async set(key: string, value: string, expireSeconds = 300): Promise<void> {
    if (!this.client) {
      this.logger.warn('⚠️ Redis client not available');
      return;
    }
    try {
      await this.client.set(key, value, 'EX', expireSeconds);  // ✅ เพิ่ม 'EX'
      this.logger.log(`✅ SET ${key} = ${value} (expire in ${expireSeconds}s)`);
    } catch (error) {
      this.logger.error(`❌ Redis SET error: ${error.message}`);
    }
  }
}
