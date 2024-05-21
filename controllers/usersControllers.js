import * as usersServices from '../services/usersServices.js';
import HttpError from '../helpers/HttpError.js';
import controllerWrapper from '../decorators/controllerWrapper.js';
import validatePassword from '../helpers/validatePassword.js';
import { createToken } from '../helpers/jwt.js';

const register = async (req, res) => {
  const user = await usersServices.findUser({ email: req.body.email });

  if (user) throw HttpError(409, 'Email is already in use');

  const newUser = await usersServices.saveUser(req.body);

  res.status(201).json({
    email: newUser.email,
    password: newUser.password,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await usersServices.findUser({ email });
  const isPasswordValid = await validatePassword(password, user.password);
  if (!user || !isPasswordValid)
    throw HttpError(401, 'Email or password is wrong');

  const { _id: id } = user;
  const payload = { id };

  const token = createToken(payload);
  await usersServices.updateUser({ _id: id }, { token });

  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await usersServices.updateUser({ _id }, { token: '' });

  res.status(204).json({ message: 'No content' });
};

const getCurrentUser = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

export default {
  register: controllerWrapper(register),
  login: controllerWrapper(login),
  logout: controllerWrapper(logout),
  getCurrentUser: controllerWrapper(getCurrentUser),
};
