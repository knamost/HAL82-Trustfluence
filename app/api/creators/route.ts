import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const niche = searchParams.get('niche');
  const minFollowers = searchParams.get('minFollowers');

  let creators = store.creators.map(({ passwordHash: _pw, ...c }) => c);

  if (niche) {
    creators = creators.filter(c => c.niche.toLowerCase() === niche.toLowerCase());
  }

  if (minFollowers) {
    const min = parseInt(minFollowers, 10);
    if (!isNaN(min)) {
      creators = creators.filter(c => c.followers >= min);
    }
  }

  return NextResponse.json(creators);
}
