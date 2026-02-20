/**
 * @file social.validation.js
 * @description Zod schemas for social metrics endpoints.
 */

import { z } from 'zod/v4';

/**
 * PUT /social/metrics
 *
 * Allows a creator to update their self-reported social metrics.
 * At least one field must be provided.
 */
export const updateSocialMetricsSchema = z.object({
  platform: z.string().max(50).optional(),
  socialHandle: z.string().max(255).optional(),
  followersCount: z.number().int().min(0).optional(),
  engagementRate: z.number().min(0).max(100).optional(),
});
