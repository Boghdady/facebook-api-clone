import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import Logger from 'bunyan';
import { config } from '@root/config';
import { NotAuthorizedError } from '@global/helpers/error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';

const logger: Logger = config.createLogger('AuthMiddleware');

class AuthMiddleware {
  public verifyToken(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.token) {
      throw new NotAuthorizedError('No token, please login again');
    }
    try {
      const payload: AuthPayload = JWT.verify(req.session?.token, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
    } catch (e) {
      throw new NotAuthorizedError('Invalid token, please login again');
    }
    next();
  }

  public checkAuth(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError('Authentication is required to access this routes.');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
