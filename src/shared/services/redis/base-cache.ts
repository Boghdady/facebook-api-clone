import { createClient } from 'redis';
import Logger from 'bunyan';
import { config } from '@root/config';

type RedisClient = ReturnType<typeof createClient>;

export abstract class BaseCache {
  client: RedisClient;
  logger: Logger;

  protected constructor(cacheName: string) {
    this.client = createClient({ url: config.REDIS_HOST });
    this.logger = config.createLogger(cacheName);
    this.cacheError();
  }

  private cacheError(): void {
    this.client.on('error', (error: unknown) => this.logger.error(error));
  }
}
