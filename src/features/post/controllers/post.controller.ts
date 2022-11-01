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

const postCache: PostCache = new PostCache();

export class PostController {
  // @joiValidation(postSchema)
  public async createPost(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } = req.body;
    const postObjectId: ObjectId = new ObjectId();

    // upload image
    const uploadedImageResponse: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
    if (!uploadedImageResponse?.public_id) {
      throw new BadRequestError(uploadedImageResponse.message);
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
      imgVersion: uploadedImageResponse.version.toString(),
      imgId: uploadedImageResponse.public_id,
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
}
