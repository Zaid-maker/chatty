import { describe, expect, it } from 'bun:test';
import { app } from '../server.js';
import { default as request } from 'supertest';

describe('Auth endpoints', () => {
  it('should return 401 for invalid login', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
  });
});
