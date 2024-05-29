import gravatar from 'gravatar';
import Jimp from 'jimp';

import fs from 'fs/promises';
import path from 'path';

import * as contactsServices from '../services/contactsServices.js';
import HttpError from '../helpers/HttpError.js';
import controllerWrapper from '../decorators/controllerWrapper.js';

const avatarsPath = path.resolve('public', 'avatars');

const getAllContacts = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 10, favorite = false } = req.query;
  const filter = { owner, favorite };
  const skip = (page - 1) * limit;
  const settings = { skip, limit, favorite };

  const result = await contactsServices.listContacts({ filter, settings });
  res.json(result);
};

const getOneContact = async (req, res) => {
  const { id: _id } = req.params;
  const { _id: owner } = req.user;
  const contact = await contactsServices.getContactById({ _id, owner });

  if (!contact) throw HttpError(404);

  res.json(contact);
};

const deleteContact = async (req, res) => {
  const { id: _id } = req.params;
  const { _id: owner } = req.user;
  const contact = await contactsServices.removeContact({ _id, owner });

  if (!contact) throw HttpError(404);

  res.json(contact);
};

const createContact = async (req, res) => {
  const { _id: owner } = req.user;
  const avatarURL = gravatar.url(req.body.email);

  const contact = await contactsServices.addContact({
    ...req.body,
    avatarURL,
    owner,
  });

  res.status(201).json(contact);
};

const updateContact = async (req, res) => {
  const { id: _id } = req.params;
  const { _id: owner } = req.user;
  const contact = await contactsServices.updateContact(
    { _id, owner },
    req.body
  );

  if (!contact) throw HttpError(404);

  res.json(contact);
};

const updateContactAvatar = async (req, res) => {
  const { id: _id } = req.params;
  let { _id: owner, avatarURL } = req.user;

  const { path: oldPath, filename } = req.file;
  const newPath = path.join(avatarsPath, filename);
  await fs.rename(oldPath, newPath);

  const avatarImage = await Jimp.read(newPath);
  avatarImage.resize(250, 250);

  const contact = await contactsServices.updateContact(
    { _id, owner },
    { avatarURL: path.join('avatars', filename) }
  );

  if (!contact) throw HttpError(404);

  res.json({ avatarURL });
};

export default {
  getAllContacts: controllerWrapper(getAllContacts),
  getOneContact: controllerWrapper(getOneContact),
  deleteContact: controllerWrapper(deleteContact),
  createContact: controllerWrapper(createContact),
  updateContact: controllerWrapper(updateContact),
  updateStatusContact: controllerWrapper(updateContact),
  updateAvatarContact: controllerWrapper(updateContactAvatar),
};
