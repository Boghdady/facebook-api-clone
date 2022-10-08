import Logger from 'bunyan';
import { config } from '@root/config';
import { DoneCallback, Job } from 'bull';
import { userService } from '@service/db/user.service';

const logger: Logger = config.createLogger('UserWorker');

// Worker get data from job and make a process on it like adding it in dbs
class UserWorker {
  async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      await userService.createUser(value);
      await job.progress(100);
      done(null, job.data);
    } catch (e) {
      logger.error(e);
      done(e as Error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
