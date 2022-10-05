import express, { Router } from 'express';
import { CurrentUser } from '@auth/controllers/current-user';
import { authMiddleware } from '@auth/middlewares/auth.middleware';

class UserRoute {
  private readonly router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/currentUser', authMiddleware.verifyToken, authMiddleware.checkAuth, CurrentUser.prototype.read);
    return this.router;
  }
}

export const userRoute: UserRoute = new UserRoute();
