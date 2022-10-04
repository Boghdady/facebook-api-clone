import express, { Router } from 'express';
import { SignupController } from '@auth/controllers/signup.controller';
import { SignInController } from '@auth/controllers/signin.controller';

class AuthRoute {
  private readonly router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', SignupController.prototype.create);
    this.router.post('/signin', SignInController.prototype.read);

    return this.router;
  }
}

export const authRout: AuthRoute = new AuthRoute();
