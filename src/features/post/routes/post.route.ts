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
    this.router.get('/:page', authMiddleware.verifyToken, authMiddleware.checkAuth, PostController.prototype.getPosts);
    this.router.put(
      '/:postId',
      authMiddleware.verifyToken,
      authMiddleware.checkAuth,
      PostController.prototype.updatePost
    );

    this.router.delete(
      '/:postId',
      authMiddleware.verifyToken,
      authMiddleware.checkAuth,
      PostController.prototype.deletePost
    );

    return this.router;
  }
}

export const postRoute: PostRoute = new PostRoute();
