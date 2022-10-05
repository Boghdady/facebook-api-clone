import { BaseCache } from '@service/redis/base-cache';
import Logger from 'bunyan';
import { config } from '@root/config';

const logger: Logger = config.createLogger('redisConnection');

class RedisConnection extends BaseCache {
  constructor() {
    super('redisConnection');
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (err) {
      logger.error(err);
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
