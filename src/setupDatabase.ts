import mongoose from 'mongoose';
import Logger from 'bunyan';

import { config } from './config';

const logger: Logger = config.createLogger('setupDatabase');

export default () => {
  const connect = () => {
    mongoose
      .connect(config.DATABASE_URL!)
      .then(() => {
        logger.info('Successfully connected to database');
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
