import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { config } from '@root/config';
import { ExpressAdapter } from '@bull-board/express';
import { IAuthJob } from '@auth/interfaces/auth.interface';

// Every type of the job data you should define here
type IBaseJobData = IAuthJob;

let bullAdapters: BullAdapter[] = [];
export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
  queue: Queue.Queue;
  logger: Logger;

  protected constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    bullAdapters.push(new BullAdapter(this.queue));
    bullAdapters = [...new Set(bullAdapters)];
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    createBullBoard({
      queues: bullAdapters,
      serverAdapter
    });

    this.logger = config.createLogger(`${queueName} Queue`);

    this.queue.on('completed', async (job: Job) => {
      // TODO: Uncomment that line in production
      // await job.remove();
    });

    this.queue.on('global:completed', (jobId: string) => {
      this.logger.info(`Job ${jobId} completed`);
    });

    this.queue.on('global:stalled', (jobId: string) => {
      this.logger.info(`Job ${jobId} is stalled`);
    });
  }

  // Add job to the queue
  // retry 3 times if it fails but before retrying wait 5 second
  protected async addJob(name: string, data: IBaseJobData): Promise<void> {
    await this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
  }

  // Process job in the queue
  //concurrency : means How many jobs do you want to be processed at a given time
  protected async processJob(
    name: string,
    concurrency: number,
    callback: Queue.ProcessCallbackFunction<void>
  ): Promise<void> {
    await this.queue.process(name, concurrency, callback);
  }
}
