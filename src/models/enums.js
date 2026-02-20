/**
 * @file enums.js
 * @description Shared PostgreSQL enums used across multiple tables.
 *
 * Centralised here to avoid circular imports between model files.
 * Every model that needs an enum imports it from this file.
 */

import { pgEnum } from 'drizzle-orm/pg-core';

// ─── User Role ───────────────────────────────────────────────────────────────
// Determines what a user can do on the platform:
//   • creator — an influencer / content creator
//   • brand   — a company looking for creators
//   • admin   — platform administrator (user management, moderation, etc.)
export const userRoleEnum = pgEnum('user_role', ['creator', 'brand', 'admin']);

// ─── Requirement Status ──────────────────────────────────────────────────────
// Lifecycle of a brand's campaign requirement:
//   • open   — actively looking for creators
//   • closed — positions filled or campaign ended
//   • paused — temporarily not accepting applications
export const requirementStatusEnum = pgEnum('requirement_status', [
  'open',
  'closed',
  'paused',
]);
