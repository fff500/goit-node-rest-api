import Contact from '../models/Contact.js';

export const listContacts = (search = {}) => {
  const { filter = {}, fields = '', settings = {} } = search;
  return Contact.find(filter, fields, settings);
};

export const getContactById = (id) => Contact.findOne({ _id: id });

export const removeContact = (id) => Contact.findByIdAndDelete(id);

export const addContact = (data) => Contact.create(data);

export const updateContact = (id, data) => Contact.findByIdAndUpdate(id, data);
