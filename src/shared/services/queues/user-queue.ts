import { BaseQueue } from '@service/queues/base-queue';
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { userWorker } from '@worker/user-worker';

class UserQueue extends BaseQueue {
  constructor() {
    super('UserQueue');
    this.processJob('addUserToDB', 5, userWorker.addUserToDB).then();
  }

  public async addUserJob(name: string, data: IAuthJob): Promise<void> {
    await this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
