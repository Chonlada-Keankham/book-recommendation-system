import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { redisConfig } from 'src/config/database.config'; // ✅ เปลี่ยนเป็น path ที่ถูกต้อง

@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis(redisConfig.url);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, expireSeconds?: number): Promise<'OK'> {
    if (expireSeconds) {
      return await this.client.set(key, value, 'EX', expireSeconds);
    }
    return await this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }
}
