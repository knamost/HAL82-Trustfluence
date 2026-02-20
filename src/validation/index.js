import { AppError } from '../utils/AppError.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function requireFields(body, fields) {
  for (const f of fields) {
    if (body[f] === undefined || body[f] === null || body[f] === '') {
      throw new AppError(`"${f}" is required`);
    }
  }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export function validateRegister(body) {
  requireFields(body, ['email', 'password', 'role']);
  if (!isEmail(body.email)) throw new AppError('Invalid email format');
  if (body.password.length < 6)
    throw new AppError('Password must be at least 6 characters');
  if (!['creator', 'brand'].includes(body.role))
    throw new AppError('Role must be "creator" or "brand"');
}

export function validateLogin(body) {
  requireFields(body, ['email', 'password']);
}

// ─── Creator Profile ─────────────────────────────────────────────────────────

export function validateCreatorProfile(body) {
  requireFields(body, ['displayName']);
  if (body.engagementRate !== undefined && (body.engagementRate < 0 || body.engagementRate > 100)) {
    throw new AppError('engagementRate must be between 0 and 100');
  }
}

// ─── Brand Profile ───────────────────────────────────────────────────────────

export function validateBrandProfile(body) {
  requireFields(body, ['companyName']);
}

// ─── Requirement ─────────────────────────────────────────────────────────────

export function validateRequirement(body) {
  requireFields(body, ['title']);
}

// ─── Rating ──────────────────────────────────────────────────────────────────

export function validateRating(body) {
  requireFields(body, ['toUserId', 'score']);
  if (!Number.isInteger(body.score) || body.score < 1 || body.score > 5) {
    throw new AppError('Score must be an integer from 1 to 5');
  }
}

// ─── Review ──────────────────────────────────────────────────────────────────

export function validateReview(body) {
  requireFields(body, ['toUserId', 'content']);
  if (body.content.trim().length === 0)
    throw new AppError('Review content cannot be empty');
}
