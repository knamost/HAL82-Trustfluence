import { POST as registerHandler } from '@/app/api/auth/register/route';
import { POST as loginHandler } from '@/app/api/auth/login/route';

function makeRequest(body: object) {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/register', () => {
  it('registers a new creator successfully', async () => {
    const req = makeRequest({
      type: 'creator',
      name: 'Test Creator',
      email: `test-${Date.now()}@example.com`,
      password: 'test123',
      niche: 'tech',
    });
    const res = await registerHandler(req as any);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.token).toBeDefined();
    expect(data.user.type).toBe('creator');
  });

  it('returns 409 on duplicate email', async () => {
    const email = `dup-${Date.now()}@example.com`;
    const body = { type: 'creator', name: 'Dup', email, password: 'pass123', niche: 'tech' };
    await registerHandler(makeRequest(body) as any);
    const res = await registerHandler(makeRequest(body) as any);
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@techcreator.com', password: 'password123' }),
    });
    const res = await loginHandler(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.token).toBeDefined();
  });

  it('returns 401 on wrong password', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@techcreator.com', password: 'wrongpassword' }),
    });
    const res = await loginHandler(req as any);
    expect(res.status).toBe(401);
  });
});
