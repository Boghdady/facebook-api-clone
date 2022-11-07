import Logger from 'bunyan';
import { config } from '@root/config';
import { DoneCallback, Job } from 'bull';
import { postService } from '@service/db/post.service';

const logger: Logger = config.createLogger('postWorker');

class PostWorker {
  async savePostToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await postService.addPostToDB(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (e) {
      logger.error(e);
      done(e as Error);
    }
  }

  async deletePostFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, KeyTwo } = job.data;
      await postService.deletePost(keyOne, KeyTwo);
      job.progress(100);
      done(null, job.data);
    } catch (e) {
      logger.error(e);
      done(e as Error);
    }
  }

  async updatePostInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await postService.updatePost(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (e) {
      logger.error(e);
      done(e as Error);
    }
  }
}

export const postWorker: PostWorker = new PostWorker();
