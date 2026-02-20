/**
 * @file feedback.controller.js
 * @description Handles HTTP request / response for ratings and reviews.
 *
 * Protected:
 *   POST /feedback/ratings   — rate another user (1–5, upsert)
 *   POST /feedback/reviews   — leave a text review
 *
 * Public:
 *   GET /feedback/ratings/:userId  — all ratings for a user + average
 *   GET /feedback/reviews/:userId  — all reviews for a user
 */

import * as ratingService from '../services/rating.service.js';

// ─── Ratings ─────────────────────────────────────────────────────────────────

/** POST /feedback/ratings — rate another user */
export async function rateUser(req, res) {
  const rating = await ratingService.upsertRating(
    req.user.id,
    req.body.toUserId,
    req.body.score,
  );
  res.status(201).json(rating);
}

/** GET /feedback/ratings/:userId — get all ratings + average for a user */
export async function getUserRatings(req, res) {
  const data = await ratingService.getRatingsForUser(req.params.userId);
  res.json(data);
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

/** POST /feedback/reviews — leave a review on another user */
export async function reviewUser(req, res) {
  const review = await ratingService.createReview(
    req.user.id,
    req.body.toUserId,
    req.body.content,
  );
  res.status(201).json(review);
}

/** GET /feedback/reviews/:userId — get all reviews for a user */
export async function getUserReviews(req, res) {
  const data = await ratingService.getReviewsForUser(req.params.userId);
  res.json(data);
}
