import { BaseCache } from '@service/redis/base-cache';
import Logger from 'bunyan';
import { config } from '@root/config';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { IPostDocument, IReactions, ISavePostToCache } from '@post/interfaces/post.interface';
import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';

const logger: Logger = config.createLogger('postCache');
export type PostCacheMultiType = string | number | Buffer | RedisCommandRawReply[] | IPostDocument | IPostDocument[];

export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }

  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { key, currentUserId, uId, createdPost } = data;
    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount,
      imgVersion,
      imgId,
      reactions,
      createdAt
    } = createdPost;

    const firstList: string[] = [
      '_id',
      `${_id}`,
      'userId',
      `${userId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'profilePicture',
      `${profilePicture}`,
      'post',
      `${post}`,
      'bgColor',
      `${bgColor}`,
      'feelings',
      `${feelings}`,
      'privacy',
      `${privacy}`,
      'gifUrl',
      `${gifUrl}`
    ];

    const secondList: string[] = [
      'commentsCount',
      `${commentsCount}`,
      'reactions',
      `${JSON.stringify(reactions)}`,
      'imgVersion',
      `${imgVersion}`,
      'imgId',
      `${imgId}`,
      'createdAt',
      `${createdAt}`
    ];

    const postToSave: string[] = [...firstList, ...secondList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      // save post to set and hash
      multi.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });
      multi.HSET(`posts:${key}`, postToSave);

      // update post count in cached user
      const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      const count: number = parseInt(postCount[0], 10) + 1;
      multi.HSET(`users:${currentUserId}`, ['postsCount', count]);
      multi.exec();
    } catch (e) {
      logger.error(e);
      throw new ServerError('Save post to redis error. try again');
    }
  }

  public async getPostFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      // 1) Will return list of postsIds that stored in sorted list
      // ZRANGE: Returns the specified range of elements in the sorted set stored
      const postsIdsInSortedSet: string[] = await this.client.ZRANGE(key, start, end, { REV: true });

      // 2) Make a for loop to get posts from redis hash
      // HGETALL: Returns all fields and values of the hash stored at key
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const postId in postsIdsInSortedSet) {
        multi.HGETALL(`posts:${postId}`);
      }
      const postsInRedisHash: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;

      //  3) Parse posts after getting it from redis
      const postsAfterParsing: IPostDocument[] = [];
      for (const post of postsInRedisHash as IPostDocument[]) {
        post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
        post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`)) as Date;
        postsAfterParsing.push(post);
      }

      return postsAfterParsing;
    } catch (e) {
      logger.error(e);
      throw new ServerError('Redis error: Get post from cache');
    }
  }

  public async getTotalPostsInCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      // ZCARD: Returns number of elements of the sorted set stored at key.
      const postsCount: number = await this.client.ZCARD('post');
      return postsCount;
    } catch (e) {
      logger.error(e);
      throw new ServerError('Redis Error: Get total posts in cache');
    }
  }

  public async getUserPostsFromCache(key: string, uId: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postsIdsInSortedSet: string[] = await this.client.ZRANGE(key, uId, uId, { REV: true, BY: 'SCORE' });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const postIdInSet of postsIdsInSortedSet) {
        multi.HGETALL(`posts:${postIdInSet}`);
      }
      const postsInRedisHash: PostCacheMultiType = (await multi.exec()) as PostCacheMultiType;

      const postsAfterParsing: IPostDocument[] = [];
      for (const hashedPost of postsInRedisHash as IPostDocument[]) {
        hashedPost.commentsCount = Helpers.parseJson(`${hashedPost.commentsCount}`) as number;
        hashedPost.reactions = Helpers.parseJson(`${hashedPost.reactions}`) as IReactions;
        hashedPost.createdAt = new Date(Helpers.parseJson(`${hashedPost.createdAt}`)) as Date;
        postsAfterParsing.push(hashedPost);
      }

      return postsAfterParsing;
    } catch (e) {
      logger.error(e);
      throw new Error('Redis Error: Get user posts from cache');
    }
  }

  public async getTotalUserPostsFromCache(uId: number): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      // ZCOUNT: Returns the number of elements in the sorted set
      return await this.client.ZCOUNT('post', uId, uId);
    } catch (e) {
      logger.error(e);
      throw new Error('Redis Error: Get total user posts from cache');
    }
  }

  public async deletePostFromCache(key: string, currentUserId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      // 1) Decrement posts count in cached user document by 1
      // HMGET: Returns the values associated with the specified fields in the hash stored at key
      const postsCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      multi.ZREM('post', `${key}`);
      multi.DEL(`posts:${key}`);
      multi.DEL(`comments:${key}`);
      multi.DEL(`reactions:${key}`);

      const postsCountAfterDec: number = parseInt(postsCount[0], 10) - 1;
      // Update postsCount field in cached user document
      multi.HSET(`users:${currentUserId}`, ['postsCount', postsCountAfterDec]);
      await multi.exec();
    } catch (e) {
      logger.error(e);
      throw new ServerError('Redis Error. Delete post from cache');
    }
  }
}
