import { Application } from 'express';
import { authRout } from '@auth/routes/auth.route';

const BASE_PATH = '/api/v1';
export default (app: Application) => {
  const routes = () => {
    app.use(BASE_PATH, authRout.routes());
  };

  routes();
};
