import mongoose from 'mongoose';
import request from 'supertest';

import app from '../app.js';

import { findUser, deleteAllUsers } from '../services/usersServices.js';
import { verifyToken } from '../helpers/jwt.js';

const { DB_HOST_TEST, PORT = 3000 } = process.env;

const userData = {
  email: 'pavlo.tereshko@gmail.com',
  password: '123456',
};

describe('test /api/users/login', () => {
  let server = null;

  beforeAll(async () => {
    await mongoose.connect(DB_HOST_TEST);
    await request(app).post('/api/users/register').send(userData);
    server = app.listen(PORT);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  afterEach(async () => {
    await deleteAllUsers();
  });

  test('test logging in with correct data', async () => {
    const { statusCode, body } = await request(app)
      .post('/api/users/login')
      .send(userData);

    expect(statusCode).toBe(200);
    expect(verifyToken(body.token)).toHaveProperty('exp', 'iat', 'id');
    expect(body.user).toHaveProperty('email', userData.email);
    expect(typeof body.user.subscription).toBe('string');
  });
});
