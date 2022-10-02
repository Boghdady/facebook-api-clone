import mongoose from 'mongoose';
import Logger from 'bunyan';

import { config } from '@root/config';
import { redisConnection } from '@service/redis/redis-connection';

const logger: Logger = config.createLogger('setupDatabase');

export default () => {
  const connect = () => {
    mongoose
      .connect(config.DATABASE_URL!)
      .then(() => {
        logger.info('Successfully connected to database');
        redisConnection.connect().then(() => logger.info('Successfully connected to redis'));
      })
      .catch((err) => {
        logger.error(`Database connection error: ${err}`);
        process.exit(1);
      });
  };

  connect();
  // If db connection fails, try to connect again
  mongoose.connection.on('disconnect', connect);
};
