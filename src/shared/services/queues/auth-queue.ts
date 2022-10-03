import { BaseQueue } from '@service/queues/base-queue';
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { authWorker } from '@worker/auth-worker';
import { userWorker } from '@worker/user-worker';

class AuthQueue extends BaseQueue {
  constructor() {
    super('AuthQueue');
    this.processJob('addAuthUserToDB', 5, authWorker.addAuthUserToDB).then();
  }

  public async addAuthJob(name: string, data: IAuthJob): Promise<void> {
    await this.addJob(name, data);
  }
}

export const authQueue: AuthQueue = new AuthQueue();
