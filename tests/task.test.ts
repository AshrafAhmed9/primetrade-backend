import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prisma';

const testUser = {
  email: 'tasktest@example.com',
  username: 'tasktestuser',
  password: 'Password1',
};

let userToken: string;
let createdTaskId: string;

describe('Tasks', () => {
  beforeAll(async () => {
    // Clean up any leftovers from a crashed previous run
    await prisma.task.deleteMany({ where: { user: { email: testUser.email } } });
    await prisma.refreshToken.deleteMany({ where: { user: { email: testUser.email } } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });

    // Register fresh and get token directly from registration response
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    userToken = res.body.data?.accessToken;
  });

  afterAll(async () => {
    await prisma.task.deleteMany({ where: { user: { email: testUser.email } } });
    await prisma.refreshToken.deleteMany({ where: { user: { email: testUser.email } } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  it('creates a task', async () => {
    const res = await request(app)
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Test task', description: 'Test description' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Test task');
    createdTaskId = res.body.data.id;
  });

  it('lists own tasks with pagination meta', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.total).toBeGreaterThan(0);
  });

  it('updates a task status', async () => {
    const res = await request(app)
      .patch(`/api/v1/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app)
      .get('/api/v1/tasks/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  it('deletes a task', async () => {
    const res = await request(app)
      .delete(`/api/v1/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });
});
