import { BaseQueue } from './base-queue';
import { IEmailJob } from '@user/interfaces/user.interface';
import { emailWorker } from '@worker/email-worker';

class EmailQueue extends BaseQueue {
  constructor() {
    super('EmailQueue');
    this.processJob('forgotPasswordEmail', 5, emailWorker.addSendEmail).then();
  }

  public async addEmailJob(name: string, data: IEmailJob): Promise<void> {
    await this.addJob(name, data);
  }
}

export const emailQueue: EmailQueue = new EmailQueue();
