/**
 * @file authService.js
 * @description Business logic for user authentication.
 *
 * Handles registration (with Argon2 password hashing), login
 * (credential verification + JWT issuance), and fetching the
 * current user's profile from the DB.
 *
 * This is the ONLY layer that interacts with the `users` table
 * for auth-related operations.
 */

import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import db from '../db/index.js';
import { users, creatorProfiles, brandProfiles } from '../models/index.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

/**
 * Register a new user.
 *
 * @param {Object}  data
 * @param {string}  data.email    – user's email (will be lower-cased)
 * @param {string}  data.password – plain-text password (will be hashed)
 * @param {string}  data.role     – 'creator' | 'brand' | 'admin'
 * @returns {{ user: Object, token: string }}
 * @throws {AppError} 409 if email is already registered
 */
export async function registerUser({ first_name, last_name, email, password, role }) {
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
      firstName: first_name || null,
      lastName: last_name || null,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    })
    .returning({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      role: users.role,
    });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return { user, token };
}

/**
 * Authenticate a user and issue a JWT.
 *
 * @param {Object}  data
 * @param {string}  data.email
 * @param {string}  data.password
 * @returns {{ user: Object, token: string }}
 * @throws {AppError} 401 if credentials are invalid
 */
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

  // Attach avatar from profile
  let avatarUrl = null;
  if (user.role === 'creator') {
    const [profile] = await db
      .select({ avatarUrl: creatorProfiles.avatarUrl })
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, user.id))
      .limit(1);
    avatarUrl = profile?.avatarUrl || null;
  } else if (user.role === 'brand') {
    const [profile] = await db
      .select({ logoUrl: brandProfiles.logoUrl })
      .from(brandProfiles)
      .where(eq(brandProfiles.userId, user.id))
      .limit(1);
    avatarUrl = profile?.logoUrl || null;
  }

  return {
    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, avatarUrl },
    token,
  };
}

/**
 * Fetch the currently authenticated user's basic info.
 *
 * @param {string} userId – UUID from the JWT payload
 * @returns {Object} user record (id, email, role, createdAt)
 * @throws {AppError} 404 if user no longer exists
 */
export async function getMe(userId) {
  const [user] = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new AppError('User not found', 404);

  // Attach avatar from profile if available
  if (user.role === 'creator') {
    const [profile] = await db
      .select({ avatarUrl: creatorProfiles.avatarUrl })
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, userId))
      .limit(1);
    user.avatarUrl = profile?.avatarUrl || null;
  } else if (user.role === 'brand') {
    const [profile] = await db
      .select({ logoUrl: brandProfiles.logoUrl })
      .from(brandProfiles)
      .where(eq(brandProfiles.userId, userId))
      .limit(1);
    user.avatarUrl = profile?.logoUrl || null;
  }

  return user;
}
