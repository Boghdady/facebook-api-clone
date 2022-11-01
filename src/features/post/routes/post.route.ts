import express, { Router } from 'express';
import { PostController } from '@post/controllers/post.controller';
import { authMiddleware } from '@auth/middlewares/auth.middleware';

class PostRoute {
  private readonly router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/', authMiddleware.verifyToken, authMiddleware.checkAuth, PostController.prototype.createPost);

    return this.router;
  }
}

export const postRoute: PostRoute = new PostRoute();
