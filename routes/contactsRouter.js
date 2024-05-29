import express from 'express';

import contactsController from '../controllers/contactsControllers.js';
import isBodyEmpty from '../middlewares/isBodyEmpty.js';
import isValidId from '../middlewares/isValidId.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import validateBody from '../decorators/validateBody.js';
import {
  createContactSchema,
  updateContactSchema,
  updateStatusContactSchema,
} from '../schemas/contactsSchemas.js';

const contactsRouter = express.Router();

contactsRouter.use(isAuthenticated);

contactsRouter.get('/', contactsController.getAllContacts);

contactsRouter.get('/:id', isValidId, contactsController.getOneContact);

contactsRouter.delete('/:id', isValidId, contactsController.deleteContact);

contactsRouter.post(
  '/',
  isBodyEmpty,
  validateBody(createContactSchema),
  contactsController.createContact
);

contactsRouter.put(
  '/:id',
  isValidId,
  isBodyEmpty,
  validateBody(updateContactSchema),
  contactsController.updateContact
);

contactsRouter.patch(
  '/:id/favorite',
  isValidId,
  isBodyEmpty,
  validateBody(updateStatusContactSchema),
  contactsController.updateStatusContact
);

export default contactsRouter;
