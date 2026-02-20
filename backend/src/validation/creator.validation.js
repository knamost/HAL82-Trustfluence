/**
 * @file creator.validation.js
 * @description Zod schemas for creator profile endpoints.
 */

import { z } from 'zod/v4';

/**
 * PUT /creators/profile
 *
 * Creates or updates the authenticated creator's profile.
 * Only `displayName` is required — everything else is optional.
 */
export const upsertCreatorProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(150),
  bio: z.string().max(2000).optional(),
  avatarUrl: z.string().url().max(500).optional(),

  // Social media fields
  platform: z.string().max(50).optional(),
  socialHandle: z.string().max(255).optional(),
  followersCount: z.number().int().min(0).optional(),
  engagementRate: z.number().min(0).max(100).optional(),

  // Categorisation
  niches: z.array(z.string()).optional(),
  promotionTypes: z.array(z.string()).optional(),
});
