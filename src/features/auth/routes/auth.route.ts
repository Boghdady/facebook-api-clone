import express, { Router } from 'express';
import { SignupController } from '@auth/controllers/signup.controller';

class AuthRoute {
  private readonly router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/signup', SignupController.prototype.create);

    return this.router;
  }
}

export const authRout: AuthRoute = new AuthRoute();
