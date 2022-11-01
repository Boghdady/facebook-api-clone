import { Request, Response } from 'express';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { postSchema } from '@post/schemes/post.schemes';
import { ObjectId } from 'mongodb';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostCache } from '@service/redis/post-cache';
import HTTP_STATUS from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { socketIOPostObject } from '@socket/post.socket';
import { postQueue } from '@service/queues/post.queue';
import { postService } from '@service/db/post.service';
import Logger from 'bunyan';
import { config } from '@root/config';

const postCache: PostCache = new PostCache();
const PAGE_SIZE = 10;
const logger: Logger = config.createLogger('PostController');

export class PostController {
  // @joiValidation(postSchema)
  public async createPost(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } = req.body;
    const postObjectId: ObjectId = new ObjectId();

    // upload image
    let uploadedImageResponse: UploadApiResponse | null = null;
    if (image) {
      uploadedImageResponse = (await uploads(image)) as UploadApiResponse;
      if (!uploadedImageResponse?.public_id) {
        throw new BadRequestError(uploadedImageResponse.message);
      }
    }

    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: uploadedImageResponse?.version.toString() || '',
      imgId: uploadedImageResponse?.public_id || '',
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
    } as IPostDocument;

    // save post to redis cache
    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdPost
    });

    // emit socket event
    socketIOPostObject.emit('AddPostEvent', createdPost);

    // Add post job to queue
    postQueue.addPostJob('addPostToDB', { key: req.currentUser?.userId, value: createdPost });

    // TODO: Call image queue to add image to mongodb
    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
  }

  public async getPosts(req: Request, res: Response): Promise<void> {
    const { page } = req.params || 1;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;

    let posts: IPostDocument[] = [];
    let totalPosts: number = 0;

    // 1) Get posts from redis cash if exist
    const cachedPosts: IPostDocument[] = await postCache.getPostsFromCache('post', newSkip, limit);
    if (cachedPosts.length) {
      posts = cachedPosts;
      totalPosts = await postCache.getTotalPostsInCache();
      logger.info('Getting posts from redis cache');
    } else {
      posts = await postService.getPosts({}, skip, limit, { createdAt: -1 });
      totalPosts = await postService.getPostsCount();
      logger.info('Getting posts from mongo database');
    }

    res.status(HTTP_STATUS.OK).json({ posts, totalPosts });
  }

  public async updatePost(req: Request, res: Response): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, image, profilePicture } = req.body;
    const { postId } = req.params;

    // upload image
    let uploadedImageResponse: UploadApiResponse | null = null;
    if (image) {
      uploadedImageResponse = (await uploads(image)) as UploadApiResponse;
      if (!uploadedImageResponse?.public_id) {
        throw new BadRequestError(uploadedImageResponse.message);
      }
    }

    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgVersion: uploadedImageResponse?.version.toString() || '',
      imgId: uploadedImageResponse?.public_id || ''
    } as IPostDocument;

    // Update post in redis cache
    const updatedPostAfterCaching: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);

    // Emit socket event
    socketIOPostObject.emit('UpdatePostEvent', updatedPostAfterCaching, 'posts');

    // Add update post job to queue
    postQueue.addPostJob('updatePostInDB', { key: postId, value: updatedPostAfterCaching });

    res.status(HTTP_STATUS.OK).json({ message: 'Updated Post Successfully' });
  }

  public async deletePost(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    socketIOPostObject.emit('DeletePostEvent', postId);
    await postCache.deletePostFromCache(postId, `${req.currentUser?.userId}`);
    postQueue.addPostJob('deletePostFromDB', { keyOne: postId, keyTwo: req.currentUser?.userId });

    res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully' });
  }
}
