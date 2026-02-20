import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import db from '../db/index.js';
import { users } from '../models/index.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export async function registerUser({ email, password, role }) {
  // Check if email already taken
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    throw new AppError('Email already registered', 409);
  }

  const hashedPassword = await argon2.hash(password);

  const [user] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    })
    .returning({ id: users.id, email: users.email, role: users.role });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return { user, token };
}

export async function loginUser({ email, password }) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await argon2.verify(user.password, password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return {
    user: { id: user.id, email: user.email, role: user.role },
    token,
  };
}

export async function getMe(userId) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new AppError('User not found', 404);
  return user;
}
