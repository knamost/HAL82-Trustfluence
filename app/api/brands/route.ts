import { NextResponse } from 'next/server';
import store from '@/lib/store';

export async function GET() {
  const brands = store.brands.map(({ passwordHash: _pw, ...b }) => b);
  return NextResponse.json(brands);
}
