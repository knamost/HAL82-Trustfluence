import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import store from '@/lib/store';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, password, name, ...rest } = body;

    if (!type || !email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type !== 'creator' && type !== 'brand') {
      return NextResponse.json({ error: 'Type must be creator or brand' }, { status: 400 });
    }

    const existingCreator = store.creators.find(c => c.email === email);
    const existingBrand = store.brands.find(b => b.email === email);
    if (existingCreator || existingBrand) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    if (type === 'creator') {
      const creator = {
        id,
        email,
        passwordHash,
        name,
        bio: rest.bio || '',
        niche: rest.niche || 'general',
        instagram: rest.instagram,
        youtube: rest.youtube,
        tiktok: rest.tiktok,
        followers: rest.followers || 0,
        avatarUrl: rest.avatarUrl,
        createdAt,
      };
      store.creators.push(creator);
      const token = signToken({ id, email, type: 'creator' });
      return NextResponse.json({ token, user: { id, email, name, type: 'creator' } }, { status: 201 });
    } else {
      const brand = {
        id,
        email,
        passwordHash,
        name,
        description: rest.description || '',
        industry: rest.industry || 'General',
        website: rest.website,
        logoUrl: rest.logoUrl,
        createdAt,
      };
      store.brands.push(brand);
      const token = signToken({ id, email, type: 'brand' });
      return NextResponse.json({ token, user: { id, email, name, type: 'brand' } }, { status: 201 });
    }
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
