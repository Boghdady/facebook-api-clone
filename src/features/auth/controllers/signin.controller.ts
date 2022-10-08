import { NextFunction, Request, Response } from 'express';
import Logger from 'bunyan';
import { config } from '@root/config';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { loginSchema } from '@auth/schemes/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { IUserDocument } from '@user/interfaces/user.interface';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { userService } from '@service/db/user.service';
import { mailTransport } from '@service/emails/mail-transport';
import { emailQueue } from '@service/queues/email-queue';

const logger: Logger = config.createLogger('SignInController');

export class SignInController {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { username, password } = req.body;

    // Check username existance
    const existingAuthUser: IAuthDocument = await authService.getAuthUserByUsername(username);
    if (!existingAuthUser) {
      throw new BadRequestError('Invalid credentials.');
    }

    // If user exist, compare password
    const passwordsMatch: boolean = await existingAuthUser.comparePassword(password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials.');
    }

    // Generate token
    const user: IUserDocument = await userService.getUserByAuthId(`${existingAuthUser._id}`);
    const userJwt: string = authService.signToken(existingAuthUser, user._id as ObjectId);

    // Add token to session
    req.session = { token: userJwt };

    // await emailQueue.addEmailJob('forgotPasswordEmail', {
    //   receiverEmail: 'llewellyn.glover@ethereal.email',
    //   subject: 'test subject',
    //   template: 'test test'
    // });

    const userDocument: IUserDocument = {
      ...user,
      authId: existingAuthUser!._id,
      username: existingAuthUser!.username,
      email: existingAuthUser!.email,
      avatarColor: existingAuthUser!.avatarColor,
      uId: existingAuthUser!.uId,
      createdAt: existingAuthUser!.createdAt
    } as IUserDocument;

    res.status(HTTP_STATUS.OK).json({ message: 'Login successfully', user: userDocument, token: userJwt });
  }
}
