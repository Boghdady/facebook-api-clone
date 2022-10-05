import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';

const logger: Logger = config.createLogger('AuthWorker');

// Worker get data from job and make a process on it like adding it in db
class AuthWorker {
  async addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      // Add method to add data to database
      await authService.createAuthUser(value);

      await job.progress(100);
      done(null, job.data);
    } catch (e) {
      logger.error(e);
      done(e as Error);
    }
  }
}

export const authWorker: AuthWorker = new AuthWorker();
