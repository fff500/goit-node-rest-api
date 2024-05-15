import { nanoid } from 'nanoid';

import fs from 'fs/promises';
import path from 'path';

const contactsPath = path.resolve('db', 'contacts.json');

const updateContacts = (contacts) =>
  fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

export const listContacts = async () => {
  return JSON.parse(await fs.readFile(contactsPath));
};

export const getContactById = async (contactId) => {
  const contacts = await listContacts();
  return contacts.find(({ id }) => id === contactId) || null;
};

export const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const index = contacts.findIndex(({ id }) => id === contactId);

  if (index === -1) return null;

  const [result] = contacts.splice(index, 1);

  await updateContacts(contacts);

  return result;
};

export const addContact = async (data) => {
  const contacts = await listContacts();
  const newContact = {
    id: nanoid(),
    ...data,
  };

  contacts.push(newContact);

  await updateContacts(contacts);

  return newContact;
};

export const updateContact = async (contactId, data) => {
  const contacts = await listContacts();
  const index = contacts.findIndex(({ id }) => id === contactId);

  if (index === -1) return null;

  contacts[index] = { ...contacts[index], ...data };

  await updateContacts(contacts);

  return contacts[index];
};
