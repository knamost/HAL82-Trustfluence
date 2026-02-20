import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';
import { getTokenFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const campaigns = user.type === 'brand'
    ? store.campaigns.filter(c => c.brandId === user.id)
    : store.campaigns.filter(c => c.creatorId === user.id);

  return NextResponse.json(campaigns);
}

export async function POST(request: NextRequest) {
  const user = getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.type !== 'brand') return NextResponse.json({ error: 'Only brands can create campaigns' }, { status: 403 });

  const { creatorId, title, description, budget } = await request.json();
  if (!creatorId || !title || !description || budget === null || budget === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const creator = store.creators.find(c => c.id === creatorId);
  if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 });

  const campaign = {
    id: crypto.randomUUID(),
    brandId: user.id,
    creatorId,
    title,
    description,
    budget,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };

  store.campaigns.push(campaign);
  return NextResponse.json(campaign, { status: 201 });
}
