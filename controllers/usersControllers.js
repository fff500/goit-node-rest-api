import gravatar from 'gravatar';
import Jimp from 'jimp';

import fs from 'fs/promises';
import path from 'path';

import * as usersServices from '../services/usersServices.js';
import HttpError from '../helpers/HttpError.js';
import controllerWrapper from '../decorators/controllerWrapper.js';
import validatePassword from '../helpers/validatePassword.js';
import { createToken } from '../helpers/jwt.js';

const avatarsPath = path.resolve('public', 'avatars');

const register = async (req, res) => {
  const user = await usersServices.findUser({ email: req.body.email });

  if (user) throw HttpError(409, 'Email is already in use');

  const avatarURL = gravatar.url(req.body.email);

  const newUser = await usersServices.saveUser({ ...req.body, avatarURL });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL: newUser.avatarURL,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await usersServices.findUser({ email });

  if (!user) throw HttpError(401, 'Email or password is wrong');

  const isPasswordValid = await validatePassword(password, user.password);
  if (!isPasswordValid) throw HttpError(401, 'Email or password is wrong');

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

const updateSubscription = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;

  await usersServices.updateUser({ _id }, { subscription });

  res.json({
    _id,
    subscription,
  });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: oldPath, filename } = req.file;
  const newPath = path.join(avatarsPath, filename);
  await fs.rename(oldPath, newPath);

  const avatarImage = await Jimp.read(newPath);
  avatarImage.resize(250, 250);

  const avatarURL = path.join('avatars', filename);
  await usersServices.updateUser({ _id }, { avatarURL });

  res.json({ avatarURL });
};

export default {
  register: controllerWrapper(register),
  login: controllerWrapper(login),
  logout: controllerWrapper(logout),
  getCurrentUser: controllerWrapper(getCurrentUser),
  updateSubscription: controllerWrapper(updateSubscription),
  updateAvatar: controllerWrapper(updateAvatar),
};
