/**
 * @file models/index.js
 * @description Barrel export for all Drizzle ORM schemas and enums.
 *
 * Import everything you need from this single file:
 *   import { users, creatorProfiles, ratings, userRoleEnum } from '../models/index.js';
 *
 * Drizzle-Kit also reads this file (via drizzle.config.js) to generate
 * and push migrations, so every table and enum must be re-exported here.
 */

// ── Enums ────────────────────────────────────────────────────────────────────
export { userRoleEnum, requirementStatusEnum } from './enums.js';

// ── Tables ───────────────────────────────────────────────────────────────────
export { users } from './user.model.js';
export { creatorProfiles } from './creatorProfile.model.js';
export { brandProfiles } from './brandProfile.model.js';
export { requirements } from './requirement.model.js';
export { ratings } from './rating.model.js';
export { reviews } from './review.model.js';
