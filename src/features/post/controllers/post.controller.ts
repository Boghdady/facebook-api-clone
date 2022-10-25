import { Request, Response } from 'express';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { postSchema } from '@post/schemes/post.schemes';
import { ObjectId } from 'mongodb';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostCache } from '@service/redis/post-cache';
import HTTP_STATUS from 'http-status-codes';

const postCache: PostCache = new PostCache();

export class PostController {
  @joiValidation(postSchema)
  public async createPostWithOutImage(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings } = req.body;
    const postObjectId: ObjectId = new ObjectId();

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
      imgVersion: '',
      imgId: '',
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

    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
  }
}
