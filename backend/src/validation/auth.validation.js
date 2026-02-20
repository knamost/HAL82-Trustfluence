/**
 * @file auth.validation.js
 * @description Zod schemas for authentication endpoints (register / login).
 *
 * Each schema validates the request body BEFORE the controller runs.
 * The `validate()` middleware in middlewares/validate.js parses the body
 * with `schema.parse()` and replaces `req.body` with the cleaned output.
 */

import { z } from 'zod/v4';

/**
 * POST /auth/register
 *
 * • email    – valid email format, lowercased
 * • password – at least 6 characters
 * • role     – one of 'creator', 'brand', or 'admin'
 *
 * NOTE: In production, consider restricting 'admin' registration
 * to an invite-only flow or a seeded super-admin account.
 */
export const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email format').transform((v) => v.toLowerCase()),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['creator', 'brand', 'admin']),
});

/**
 * POST /auth/login
 *
 * • email    – required string
 * • password – required string
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});
