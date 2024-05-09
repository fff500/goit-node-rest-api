import * as contactsServices from '../services/contactsServices.js';
import HttpError from '../helpers/HttpError.js';
import controllerWrapper from '../decorators/controllerWrapper.js';

const getAllContacts = async (_, res) => {
  const result = await contactsServices.listContacts();
  res.json(result);
};

const getOneContact = async (req, res) => {
  const contact = await contactsServices.getContactById(req.params.id);

  if (!contact) throw HttpError(404);

  res.json(contact);
};

const deleteContact = async (req, res) => {
  const contact = await contactsServices.removeContact(req.params.id);

  if (!contact) throw HttpError(404);

  res.json(contact);
};

const createContact = async (req, res) => {
  const contact = await contactsServices.addContact(req.body);

  res.status(201).json(contact);
};

const updateContact = async (req, res) => {
  const contact = await contactsServices.updateContact(req.params.id, req.body);

  if (!contact) throw HttpError(404);

  res.status(200).json(contact);
};

export default {
  getAllContacts: controllerWrapper(getAllContacts),
  getOneContact: controllerWrapper(getOneContact),
  deleteContact: controllerWrapper(deleteContact),
  createContact: controllerWrapper(createContact),
  updateContact: controllerWrapper(updateContact),
};
