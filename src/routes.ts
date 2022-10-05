import { Application } from 'express';
import { authRoute } from '@auth/routes/auth.route';
import { serverAdapter } from '@service/queues/base-queue';
import { userRoute } from '@user/routes/user.route';

const BASE_PATH = '/api/v1';
export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoute.routes());
    app.use(`${BASE_PATH}/users`, userRoute.routes());
  };

  routes();
};
