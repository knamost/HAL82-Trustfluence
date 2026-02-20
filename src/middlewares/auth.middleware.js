/**
 * @file auth.js
 * @description Authentication & authorisation middleware.
 *
 * authenticate() — Extracts the JWT from the `Authorization: Bearer <token>`
 *   header, verifies it, and attaches the decoded payload to `req.user`.
 *   Must be applied BEFORE any route that needs a logged-in user.
 *
 * authorize(...roles) — Restricts access to users whose `req.user.role`
 *   matches one of the given roles.  Must be applied AFTER authenticate().
 *   Example: authorize('brand')          — brand only
 *            authorize('creator','admin') — creator or admin
 */

import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  try {
    const token = authHeader.split(' ')[1];
    req.user = verifyToken(token);
    next();
  } catch {
    return next(new AppError('Invalid or expired token', 401));
  }
}

/**
 * Restrict access to specific roles.
 *
 * @param  {...string} roles — allowed roles ('creator', 'brand', 'admin')
 * @returns {Function} Express middleware
 *
 * Usage:
 *   router.post('/admin-only', authenticate, authorize('admin'), handler);
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }
    next();
  };
}
