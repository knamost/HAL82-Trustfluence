import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRating, validateReview } from '../validation/index.js';
import * as ratingService from '../services/ratingService.js';

const router = Router();

// ─── Ratings ─────────────────────────────────────────────────────────────────

// POST /feedback/ratings — rate a user (protected)
router.post(
  '/ratings',
  authenticate,
  asyncHandler(async (req, res) => {
    validateRating(req.body);
    const rating = await ratingService.upsertRating(
      req.user.id,
      req.body.toUserId,
      req.body.score
    );
    res.status(201).json(rating);
  })
);

// GET /feedback/ratings/:userId — get ratings for a user (public)
router.get(
  '/ratings/:userId',
  asyncHandler(async (req, res) => {
    const data = await ratingService.getRatingsForUser(req.params.userId);
    res.json(data);
  })
);

// ─── Reviews ─────────────────────────────────────────────────────────────────

// POST /feedback/reviews — leave a review (protected)
router.post(
  '/reviews',
  authenticate,
  asyncHandler(async (req, res) => {
    validateReview(req.body);
    const review = await ratingService.createReview(
      req.user.id,
      req.body.toUserId,
      req.body.content
    );
    res.status(201).json(review);
  })
);

// GET /feedback/reviews/:userId — get reviews for a user (public)
router.get(
  '/reviews/:userId',
  asyncHandler(async (req, res) => {
    const data = await ratingService.getReviewsForUser(req.params.userId);
    res.json(data);
  })
);

export default router;
