import { Request, Response } from 'express';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { signupSchema } from '@auth/schemes/signup';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { ObjectId } from 'mongodb';
import { Helpers } from '@global/helpers/helpers';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { uploads } from '@global/helpers/cloudinary-upload';
import { UploadApiResponse } from 'cloudinary';
import HTTP_STATUS from 'http-status-codes';

export class SignupController {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;
    // 1) Check if there is user with provided username and email
    const checkIfUserExists = await authService.getUserByUsernameOrEmail(username, email);
    if (checkIfUserExists) {
      throw new BadRequestError('Account already exists, please login.');
    }

    // 2) Prepare auth data
    // We create the objectId by our self because we will save
    // it in a redis before we access mongodb
    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;

    // The reason we are using SignupController.prototype.signupData and not
    // this.signupData is because of how we invoke the create method in the routes method.
    // the scope of "this" object is not kept when the method is invoked
    const authData: IAuthDocument = SignupController.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });

    // Will overwrite the image if it exist
    const upload: UploadApiResponse = (await uploads(avatarImage, `${authObjectId}`, true, true)) as UploadApiResponse;
    if (!upload?.public_id) {
      throw new BadRequestError('File upload failed. Try again');
    }

    res.status(HTTP_STATUS.CREATED).json({ message: 'User Created Successfully', authData, upload });
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, avatarColor, password } = data;
    return {
      _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.lowercase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }
}