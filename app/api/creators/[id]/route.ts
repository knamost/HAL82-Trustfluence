import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const creator = store.creators.find(c => c.id === id);
  if (!creator) return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
  const { passwordHash: _pw, ...safeCreator } = creator;
  return NextResponse.json(safeCreator);
}
