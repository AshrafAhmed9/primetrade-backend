import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prisma';

const testUser = {
  email: 'authtest@example.com',
  username: 'authtestuser',
  password: 'Password1',
};

describe('Auth', () => {
  afterAll(async () => {
    await prisma.refreshToken.deleteMany({ where: { user: { email: testUser.email } } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  it('registers a new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
    expect(res.body.data.password).toBeUndefined();
  });

  it('rejects duplicate email on register', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'WrongPass1' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('logs in and returns accessToken', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects invalid body on register', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'notanemail', username: 'x', password: '123' });
    expect(res.status).toBe(422);
    expect(res.body.details).toBeDefined();
  });
});
