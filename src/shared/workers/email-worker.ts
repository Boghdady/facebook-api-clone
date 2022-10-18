import { DoneCallback, Job } from 'bull';
import { mailTransport } from '@service/emails/mail-transport';
import Logger from 'bunyan';
import { config } from '@root/config';

const logger: Logger = config.createLogger('EmailWorker');

// Worker get data from job and make a process on it like adding it in db
class EmailWorker {
  async addSendEmail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { receiverEmail, subject, template } = job.data;
      await mailTransport.sendEmail(receiverEmail, subject, template);
      await job.progress(100);
      done(null, job.data);
    } catch (e) {
      logger.error(e);
      done(e as Error);
    }
  }
}

export const emailWorker: EmailWorker = new EmailWorker();
