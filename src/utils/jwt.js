/**
 * @file jwt.js
 * @description JWT helper functions for signing and verifying tokens.
 *
 * Configuration (via .env):
 *   JWT_SECRET     — signing key (MUST be changed in production)
 *   JWT_EXPIRES_IN — token lifetime, e.g. '7d', '1h'
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'trustfluence-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Create a signed JWT.
 *
 * @param {Object} payload — data to encode (typically { id, email, role })
 * @returns {string} signed JWT string
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT.
 *
 * @param {string} token — the raw JWT string
 * @returns {Object} decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError} on invalid / expired token
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
