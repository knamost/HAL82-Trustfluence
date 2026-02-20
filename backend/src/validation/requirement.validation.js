/**
 * @file requirement.validation.js
 * @description Zod schemas for campaign-requirement endpoints.
 */

import { z } from 'zod/v4';

/**
 * POST /requirements  (create)
 *
 * Only `title` is required. Everything else is optional so brands
 * can fill in details progressively.
 */
export const createRequirementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().max(5000).optional(),
  niches: z.array(z.string()).optional(),
  minFollowers: z.number().int().min(0).optional(),
  minEngagementRate: z.number().min(0).max(100).optional(),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
});

/**
 * PUT /requirements/:id  (update)
 *
 * All fields are optional — only send what you want to change.
 * `status` can also be updated here to close or pause a requirement.
 */
export const updateRequirementSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  niches: z.array(z.string()).optional(),
  minFollowers: z.number().int().min(0).optional(),
  minEngagementRate: z.number().min(0).max(100).optional(),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
  status: z.enum(['open', 'closed', 'paused']).optional(),
});
