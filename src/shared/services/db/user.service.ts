import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.model';
import mongoose from 'mongoose';

class UserService {
  public async createUser(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }

  public async getUserById(userId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authUser' } },
      { $unwind: '$authUser' }, // convert list to object
      { $project: this.aggregateProject() }
    ]);
    return users[0];
  }

  public async getUserByAuthId(authId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { authId: new mongoose.Types.ObjectId(authId) } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authUser' } },
      { $unwind: '$authUser' }, // convert list to object
      { $project: this.aggregateProject() }
    ]);
    return users[0];
  }

  // if value = 1 will return field in response if 0 will not return it
  private aggregateProject() {
    return {
      _id: 1,
      username: '$authUser.username',
      uId: '$authUser.uId',
      email: '$authUser.email',
      avatarColor: '$authUser.avatarColor',
      createdAt: '$authUser.createdAt',
      postsCount: 1,
      work: 1,
      school: 1,
      quote: 1,
      location: 1,
      blocked: 1,
      blockedBy: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      bgImageVersion: 1,
      bgImageId: 1,
      profilePicture: 1
    };
  }
}

export const userService: UserService = new UserService();
