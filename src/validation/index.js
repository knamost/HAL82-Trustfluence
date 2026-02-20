/**
 * @file validation/index.js
 * @description Barrel export — re-exports every Zod schema from one place.
 *
 * Usage:
 *   import { registerSchema, ratingSchema } from '../validation/index.js';
 */

export { registerSchema, loginSchema } from './auth.validation.js';
export { upsertCreatorProfileSchema } from './creator.validation.js';
export { upsertBrandProfileSchema } from './brand.validation.js';
export { createRequirementSchema, updateRequirementSchema } from './requirement.validation.js';
export { ratingSchema, reviewSchema } from './feedback.validation.js';
