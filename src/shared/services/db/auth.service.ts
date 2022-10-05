import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { Helpers } from '@global/helpers/helpers';
import { AuthModel } from '@auth/models/auth.model';
import { ObjectId } from 'mongodb';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';

class AuthService {
  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Helpers.firstLetterUppercase(username) }, { email: Helpers.lowercase(email) }]
    };

    return (await AuthModel.findOne(query)) as IAuthDocument;
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    return (await AuthModel.findOne({ username: Helpers.firstLetterUppercase(username) })) as IAuthDocument;
  }

  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public signToken(data: IAuthDocument, userId: ObjectId): string {
    return JWT.sign(
      {
        userId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN!
    );
  }
}

export const authService: AuthService = new AuthService();
