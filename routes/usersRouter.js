import express from 'express';

import usersControllers from '../controllers/usersControllers.js';
import isBodyEmpty from '../middlewares/isBodyEmpty.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/upload.js';
import validateBody from '../decorators/validateBody.js';
import {
  loginSchema,
  registerSchema,
  updateSubscriptionSchema,
} from '../schemas/usersSchemas.js';

const usersRouter = express.Router();

usersRouter.post(
  '/register',
  isBodyEmpty,
  validateBody(registerSchema),
  usersControllers.register
);

usersRouter.post(
  '/login',
  isBodyEmpty,
  validateBody(loginSchema),
  usersControllers.login
);

usersRouter.post('/logout', isAuthenticated, usersControllers.logout);

usersRouter.get('/current', isAuthenticated, usersControllers.getCurrentUser);

usersRouter.patch(
  '/',
  isAuthenticated,
  validateBody(updateSubscriptionSchema),
  usersControllers.updateSubscription
);

usersRouter.patch(
  '/avatar',
  upload.single('avatar'),
  isAuthenticated,
  usersControllers.updateAvatar
);

export default usersRouter;
