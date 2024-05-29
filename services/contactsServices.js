import Contact from '../models/Contact.js';

export const listContacts = (search = {}) => {
  const { filter = {}, fields = '', settings = {} } = search;
  return Contact.find(filter, fields, settings);
};

export const getContactById = (filter) => Contact.findOne(filter);

export const removeContact = (filter) => Contact.findOneAndDelete(filter);

export const addContact = (data) => Contact.create(data);

export const updateContact = (filter, data) =>
  Contact.findOneAndUpdate(filter, data);
