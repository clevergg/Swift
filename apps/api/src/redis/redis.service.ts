import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;

  onModuleInit(): void {
    this.client = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379');
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  async saveRefreshToken(userId: string, jti: string, ttlSeconds: number): Promise<void> {
    await this.client.set(`refresh:${userId}:${jti}`, '1', 'EX', ttlSeconds);
  }

  async refreshTokenExists(userId: string, jti: string): Promise<boolean> {
    const result = await this.client.exists(`refresh:${userId}:${jti}`);
    return result === 1;
  }

  async deleteRefreshToken(userId: string, jti: string): Promise<void> {
    await this.client.del(`refresh:${userId}:${jti}`);
  }

  async deleteAllUserTokens(userId: string): Promise<void> {
    const pattern = `refresh:${userId}:*`;
    const keys: string[] = [];
    let cursor = '0';
    do {
      const [nextCursor, found] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      keys.push(...found);
      cursor = nextCursor;
    } while (cursor !== '0');

    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }
}
