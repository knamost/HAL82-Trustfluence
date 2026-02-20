/**
 * @file brand.validation.js
 * @description Zod schemas for brand profile endpoints.
 */

import { z } from 'zod/v4';

/**
 * PUT /brands/profile
 *
 * Creates or updates the authenticated brand's profile.
 * Only `companyName` is required.
 */
export const upsertBrandProfileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(255),
  bio: z.string().max(2000).optional(),
  logoUrl: z.string().url().max(500).optional(),
  website: z.string().url().max(500).optional(),
  category: z.string().max(100).optional(),
});
