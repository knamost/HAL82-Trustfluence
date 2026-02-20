import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import store from '@/lib/store';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const creator = store.creators.find(c => c.email === email);
    if (creator) {
      const valid = await bcrypt.compare(password, creator.passwordHash);
      if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      const token = signToken({ id: creator.id, email: creator.email, type: 'creator' });
      return NextResponse.json({ token, user: { id: creator.id, email: creator.email, name: creator.name, type: 'creator' } });
    }

    const brand = store.brands.find(b => b.email === email);
    if (brand) {
      const valid = await bcrypt.compare(password, brand.passwordHash);
      if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      const token = signToken({ id: brand.id, email: brand.email, type: 'brand' });
      return NextResponse.json({ token, user: { id: brand.id, email: brand.email, name: brand.name, type: 'brand' } });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
