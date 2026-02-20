import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';
import { getTokenFromRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getTokenFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.type !== 'creator') return NextResponse.json({ error: 'Only creators can update campaign status' }, { status: 403 });

  const { id } = await params;
  const campaign = store.campaigns.find(c => c.id === id);
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  if (campaign.creatorId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { status } = await request.json();
  if (status !== 'accepted' && status !== 'declined') {
    return NextResponse.json({ error: 'Status must be accepted or declined' }, { status: 400 });
  }

  campaign.status = status;
  return NextResponse.json(campaign);
}
