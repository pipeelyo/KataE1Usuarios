import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

const POOL_SIZE = Number(process.env.REDIS_POOL_SIZE || 4);

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly clients: Redis[] = [];
  private cursor = 0;

  constructor() {
    const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
    for (let i = 0; i < POOL_SIZE; i++) {
      this.clients.push(
        new Redis(url, {
          maxRetriesPerRequest: 2,
          enableReadyCheck: true,
          lazyConnect: false,
        }),
      );
    }
  }

  conn() {
    const client = this.clients[this.cursor % this.clients.length];
    this.cursor += 1;
    return client;
  }

  size() {
    return this.clients.length;
  }

  async ping() {
    return this.conn().ping();
  }

  async get(key: string) {
    return this.conn().get(key);
  }

  async set(key: string, value: string, ttlSec?: number) {
    if (ttlSec && ttlSec > 0) {
      await this.conn().set(key, value, "EX", ttlSec);
      return;
    }
    await this.conn().set(key, value);
  }

  async onModuleDestroy() {
    await Promise.all(this.clients.map((c) => c.quit().catch(() => undefined)));
  }
}
