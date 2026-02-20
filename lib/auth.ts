import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'trustfluence-secret-key-mvp';

export interface TokenPayload {
  id: string;
  email: string;
  type: 'creator' | 'brand';
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): TokenPayload | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}
