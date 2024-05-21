import express from 'express';

import usersControllers from '../controllers/usersControllers.js';
import isBodyEmpty from '../middlewares/isBodyEmpty.js';
import validateBody from '../decorators/validateBody.js';
import { loginSchema, registerSchema } from '../schemas/usersSchemas.js';

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

export default usersRouter;