/**
 * @file application.validation.js
 * @description Zod schemas for application endpoints.
 */

import { z } from 'zod/v4';

/**
 * POST /applications  (apply to a campaign)
 *
 * `requirementId` is required. Cover letter and proposed rate are optional.
 */
export const createApplicationSchema = z.object({
  requirementId: z.string().uuid('Invalid requirement ID'),
  coverLetter: z.string().max(5000).optional(),
  proposedRate: z.number().int().min(0).optional(),
});

/**
 * PUT /applications/:id/status  (brand accepts/rejects)
 */
export const updateApplicationStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
});
