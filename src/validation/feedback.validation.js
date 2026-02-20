/**
 * @file feedback.validation.js
 * @description Zod schemas for rating and review endpoints.
 */

import { z } from 'zod/v4';

/**
 * POST /feedback/ratings
 *
 * • toUserId – UUID of the user being rated
 * • score    – integer 1–5
 */
export const ratingSchema = z.object({
  toUserId: z.uuid('Invalid user ID'),
  score: z.number().int().min(1, 'Min rating is 1').max(5, 'Max rating is 5'),
});

/**
 * POST /feedback/reviews
 *
 * • toUserId – UUID of the user being reviewed
 * • content  – non-empty review text (max 5 000 chars)
 */
export const reviewSchema = z.object({
  toUserId: z.uuid('Invalid user ID'),
  content: z.string().min(1, 'Review content cannot be empty').max(5000),
});
