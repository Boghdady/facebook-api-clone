import { BaseQueue } from '@service/queues/base-queue';
import { IAuthJob } from '@auth/interfaces/auth.interface';

class AuthQueue extends BaseQueue {
  constructor() {
    super('AuthQueue');
  }

  public async addAuthJob(name: string, data: IAuthJob): Promise<void> {
    await this.addJob(name, data);
  }
}

export const authQueue: AuthQueue = new AuthQueue();
