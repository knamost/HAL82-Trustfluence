/**
 * @file routes/feedback.js
 * @description Rating and review routes.
 *
 * POST /feedback/ratings          — rate a user      (authenticated, validated)
 * GET  /feedback/ratings/:userId  — ratings for user  (public)
 * POST /feedback/reviews          — review a user     (authenticated, validated)
 * GET  /feedback/reviews/:userId  — reviews for user  (public)
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { ratingSchema, reviewSchema } from '../validation/feedback.validation.js';
import * as feedbackCtrl from '../controllers/feedback.controller.js';

const router = Router();

// ── Ratings ──────────────────────────────────────────────────────────────────
router.post('/ratings', authenticate, validate(ratingSchema), asyncHandler(feedbackCtrl.rateUser));
router.get('/ratings/:userId', asyncHandler(feedbackCtrl.getUserRatings));

// ── Reviews ──────────────────────────────────────────────────────────────────
router.post('/reviews', authenticate, validate(reviewSchema), asyncHandler(feedbackCtrl.reviewUser));
router.get('/reviews/:userId', asyncHandler(feedbackCtrl.getUserReviews));

export default router;
