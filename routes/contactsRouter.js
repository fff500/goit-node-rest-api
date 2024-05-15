import express from 'express';

import contactsController from '../controllers/contactsControllers.js';
import isBodyEmpty from '../middlewares/isBodyEmpty.js';
import validateBody from '../decorators/validateBody.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../schemas/contactsSchemas.js';

const contactsRouter = express.Router();

contactsRouter.get('/', contactsController.getAllContacts);

contactsRouter.get('/:id', contactsController.getOneContact);

contactsRouter.delete('/:id', contactsController.deleteContact);

contactsRouter.post(
  '/',
  isBodyEmpty,
  validateBody(createContactSchema),
  contactsController.createContact
);

contactsRouter.put(
  '/:id',
  isBodyEmpty,
  validateBody(updateContactSchema),
  contactsController.updateContact
);

export default contactsRouter;
