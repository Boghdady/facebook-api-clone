import { NextFunction, Request, Response } from 'express';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userCache } from '@service/redis/user-cache';
import { userService } from '@service/db/user.service';
import HTTP_STATUS from 'http-status-codes';

export class CurrentUser {
  public async read(req: Request, res: Response, _next: NextFunction): Promise<void> {
    let isUser = false;
    let token = null;
    let user = null;

    const cachedUser: IUserDocument = (await userCache.getUserFromCache(`${req.currentUser!.userId}`)) as IUserDocument;
    const existingUser: IUserDocument = cachedUser
      ? cachedUser
      : await userService.getUserById(`${req.currentUser!.userId}`);

    // check object not empty and contain values
    if (Object.keys(existingUser).length) {
      isUser = true;
      token = req.session?.token;
      user = existingUser;
    }

    res.status(HTTP_STATUS.OK).json({ token, isUser, user });
  }
}
