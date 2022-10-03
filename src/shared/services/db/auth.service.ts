import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { Helpers } from '@global/helpers/helpers';
import { AuthModel } from '@auth/models/auth.model';

class AuthService {
  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Helpers.firstLetterUppercase(username) }, { email: Helpers.lowercase(email) }]
    };

    return (await AuthModel.findOne(query)) as IAuthDocument;
  }

  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }
}

export const authService: AuthService = new AuthService();
