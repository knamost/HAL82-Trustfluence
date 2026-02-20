import { POST as createCampaign } from '@/app/api/campaigns/route';
import { PATCH as updateCampaign } from '@/app/api/campaigns/[id]/route';
import { signToken } from '@/lib/auth';

const brandToken = signToken({ id: 'brand-1', email: 'marketing@techgadgets.com', type: 'brand' });
const creatorToken = signToken({ id: 'creator-1', email: 'alex@techcreator.com', type: 'creator' });

function makeAuthRequest(url: string, token: string, method = 'GET', body?: object) {
  return new Request(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('POST /api/campaigns', () => {
  it('creates a campaign as brand', async () => {
    const req = makeAuthRequest('http://localhost/api/campaigns', brandToken, 'POST', {
      creatorId: 'creator-2',
      title: 'Test Campaign',
      description: 'A test collaboration',
      budget: 1000,
    });
    const res = await createCampaign(req as any);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.title).toBe('Test Campaign');
    expect(data.status).toBe('pending');
  });

  it('returns 400 when budget is zero or negative', async () => {
    const req = makeAuthRequest('http://localhost/api/campaigns', brandToken, 'POST', {
      creatorId: 'creator-2',
      title: 'Bad Budget',
      description: 'Budget is zero',
      budget: 0,
    });
    const res = await createCampaign(req as any);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/positive/i);
  });

  it('returns 403 when creator tries to create campaign', async () => {
    const req = makeAuthRequest('http://localhost/api/campaigns', creatorToken, 'POST', {
      creatorId: 'creator-2',
      title: 'Unauthorized',
      description: 'Should fail',
      budget: 500,
    });
    const res = await createCampaign(req as any);
    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/campaigns/[id]', () => {
  it('creator can accept a campaign', async () => {
    const req = makeAuthRequest('http://localhost/api/campaigns/campaign-1', creatorToken, 'PATCH', {
      status: 'accepted',
    });
    const res = await updateCampaign(req as any, { params: Promise.resolve({ id: 'campaign-1' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('accepted');
  });

  it('creator can decline a campaign', async () => {
    // First set it back to pending
    const store = (await import('@/lib/store')).default;
    const campaign = store.campaigns.find(c => c.id === 'campaign-1');
    if (campaign) campaign.status = 'pending';

    const req = makeAuthRequest('http://localhost/api/campaigns/campaign-1', creatorToken, 'PATCH', {
      status: 'declined',
    });
    const res = await updateCampaign(req as any, { params: Promise.resolve({ id: 'campaign-1' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('declined');
  });
});
