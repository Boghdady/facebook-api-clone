import { NextFunction, Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class SignOutController {
  public async clearToken(req: Request, res: Response, _next: NextFunction): Promise<void> {
    req.session = null;
    res.status(HTTP_STATUS.OK).json({ message: 'Logout successfully.', data: {}, token: '' });
  }
}
