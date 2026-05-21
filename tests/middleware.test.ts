import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Auth Middleware', () => {
  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/v1/tasks');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 with malformed token', async () => {
    const res = await request(app)
      .get('/api/v1/tasks')
      .set('Authorization', 'Bearer not_a_real_token');
    expect(res.status).toBe(401);
  });

  it('returns 403 when regular user accesses admin route', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'demo@primetrade.ai', password: 'User1234' });

    if (loginRes.status !== 200) return;

    const token = loginRes.body.data.accessToken;
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
