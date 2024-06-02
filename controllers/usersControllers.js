import gravatar from 'gravatar';
import Jimp from 'jimp';
import { nanoid } from 'nanoid';

import fs from 'fs/promises';
import path from 'path';

import * as usersServices from '../services/usersServices.js';
import controllerWrapper from '../decorators/controllerWrapper.js';
import HttpError from '../helpers/HttpError.js';
import validatePassword from '../helpers/validatePassword.js';
import { createToken } from '../helpers/jwt.js';
import sendEmail from '../helpers/sendEmail.js';

const avatarsPath = path.resolve('public', 'avatars');

const register = async (req, res) => {
  const { email } = req.body;
  const user = await usersServices.findUser({ email });

  if (user) throw HttpError(409, 'Email is already in use');

  const verificationToken = nanoid();
  const avatarURL = gravatar.url(email);
  const newUser = await usersServices.saveUser({
    ...req.body,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: 'Verify email',
    html: `<a target='_blank' href='http://localhost:3000/api/users/verify/${verificationToken}'>Verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL: newUser.avatarURL,
    },
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await usersServices.findUser({ verificationToken });

  if (!user) throw HttpError(404, 'User was not found');

  await usersServices.updateUser(
    { _id: user._id },
    { verified: true, verificationToken: null }
  );

  res.json({
    message: 'Verification successful',
  });
};

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  const user = await usersServices.findUser({ email });

  if (!user) throw HttpError(401, 'Email was not found');

  if (user.verified)
    throw HttpError(400, 'Verification has already been passed');

  const verifyEmail = {
    to: req.body.email,
    subject: 'Verify email',
    html: `<a target='_blank' href='http://localhost:3000/api/users/verify/${user.verificationToken}'>Verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: 'Verify email sent',
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await usersServices.findUser({ email });

  if (!user) throw HttpError(401, 'Email or password is wrong');

  if (!user.verified) throw HttpError(401, 'Email is not verified');

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
  if (!req.file) throw HttpError(404, 'Please, upload avatar.');

  const { _id } = req.user;
  const { path: oldPath, filename } = req.file;
  const newPath = path.join(avatarsPath, filename);
  const avatarImage = await Jimp.read(oldPath);
  avatarImage.resize(250, 250).write(oldPath);
  await fs.rename(oldPath, newPath);

  const avatarURL = path.join('avatars', filename);
  await usersServices.updateUser({ _id }, { avatarURL });

  res.json({ avatarURL });
};

export default {
  register: controllerWrapper(register),
  verify: controllerWrapper(verify),
  resendVerificationEmail: controllerWrapper(resendVerificationEmail),
  login: controllerWrapper(login),
  logout: controllerWrapper(logout),
  getCurrentUser: controllerWrapper(getCurrentUser),
  updateSubscription: controllerWrapper(updateSubscription),
  updateAvatar: controllerWrapper(updateAvatar),
};
