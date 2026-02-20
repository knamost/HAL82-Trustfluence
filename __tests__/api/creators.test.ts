import { GET as getCreators } from '@/app/api/creators/route';

describe('GET /api/creators', () => {
  it('returns a list of creators', async () => {
    const req = new Request('http://localhost/api/creators');
    const res = await getCreators(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].passwordHash).toBeUndefined();
  });

  it('filters creators by niche', async () => {
    const req = new Request('http://localhost/api/creators?niche=tech');
    const res = await getCreators(req as any);
    const data = await res.json();
    expect(data.every((c: any) => c.niche === 'tech')).toBe(true);
  });

  it('filters creators by minFollowers', async () => {
    const req = new Request('http://localhost/api/creators?minFollowers=300000');
    const res = await getCreators(req as any);
    const data = await res.json();
    expect(data.every((c: any) => c.followers >= 300000)).toBe(true);
  });
});
