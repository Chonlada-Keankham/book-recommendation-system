import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { redisConfig } from 'src/config/database.config'; // ✅ ระวัง path

@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis(redisConfig.url);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<string> {
    if (expirySeconds) {
      return this.client.set(key, value, 'EX', expirySeconds); 
    }
    return this.client.set(key, value); 
  }

  async disconnect() {
    await this.client.quit();
  }
}
