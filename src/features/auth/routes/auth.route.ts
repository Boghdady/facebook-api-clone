import express, { Router } from 'express';
import { SignupController } from '@auth/controllers/signup.controller';
import { SignInController } from '@auth/controllers/signin.controller';
import { SignOutController } from '@auth/controllers/signout.controller';

class AuthRoute {
  private readonly router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', SignupController.prototype.create);
    this.router.post('/signin', SignInController.prototype.read);

    // TODO: Add auth middleware here, use should be logged to allow to signout
    this.router.get('/signout', SignOutController.prototype.clearToken);

    return this.router;
  }
}

export const authRoute: AuthRoute = new AuthRoute();
