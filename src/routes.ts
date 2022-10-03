import { Application } from 'express';
import { authRout } from '@auth/routes/auth.route';
import { serverAdapter } from '@service/queues/base-queue';

const BASE_PATH = '/api/v1';
export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRout.routes());
  };

  routes();
};
