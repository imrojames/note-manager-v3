import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('auth', () => {
  it('registers a new user, returns a safe user, and sets a cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'password123', name: 'Ada' });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: 'a@b.com', name: 'Ada' });
    expect(res.body.user.id).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie']?.[0]).toMatch(/token=/);
  });

  it('rejects a duplicate email with 409', async () => {
    const payload = { email: 'dup@b.com', password: 'password123' };
    await request(app).post('/api/auth/register').send(payload);
    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('rejects a weak password with a validation error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'weak@b.com', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('logs in with correct credentials and rejects the wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'c@b.com', password: 'password123' });

    const ok = await request(app)
      .post('/api/auth/login')
      .send({ email: 'c@b.com', password: 'password123' });
    expect(ok.status).toBe(200);

    const bad = await request(app)
      .post('/api/auth/login')
      .send({ email: 'c@b.com', password: 'wrongpassword' });
    expect(bad.status).toBe(401);
  });

  it('GET /me requires auth and returns the current user when authenticated', async () => {
    const anon = await request(app).get('/api/auth/me');
    expect(anon.status).toBe(401);

    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({ email: 'd@b.com', password: 'password123' });
    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('d@b.com');
  });
});
