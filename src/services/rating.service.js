/**
 * @file ratingService.js
 * @description Business logic for ratings (1–5 stars) and text reviews.
 *
 * Ratings use an upsert strategy: each (from, to) pair can have at most
 * one rating. Submitting again updates the existing score.
 *
 * Reviews have no uniqueness constraint — users can leave multiple.
 */

import { eq, and, sql } from 'drizzle-orm';
import db from '../db/index.js';
import { ratings, reviews } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

// ─── Ratings ─────────────────────────────────────────────────────────────────

/**
 * Create or update a rating from one user to another.
 *
 * @param {string} fromUserId – rater's UUID
 * @param {string} toUserId   – target user's UUID
 * @param {number} score      – integer 1–5
 * @returns {Object} rating row
 * @throws {AppError} 400 if rating yourself
 */
export async function upsertRating(fromUserId, toUserId, score) {
  if (fromUserId === toUserId) throw new AppError('Cannot rate yourself');

  // Upsert: one rating per (from, to) pair
  const [existing] = await db
    .select()
    .from(ratings)
    .where(and(eq(ratings.fromUserId, fromUserId), eq(ratings.toUserId, toUserId)))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(ratings)
      .set({ score })
      .where(eq(ratings.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(ratings)
    .values({ fromUserId, toUserId, score })
    .returning();
  return created;
}

/**
 * Get all ratings for a user, plus the computed average and count.
 *
 * @param {string} userId – target user's UUID
 * @returns {{ ratings: Object[], avgRating: string, ratingCount: number }}
 */
export async function getRatingsForUser(userId) {
  const rows = await db
    .select()
    .from(ratings)
    .where(eq(ratings.toUserId, userId));

  const [agg] = await db
    .select({
      avg: sql`COALESCE(AVG(${ratings.score}), 0)`,
      count: sql`COUNT(${ratings.id})`,
    })
    .from(ratings)
    .where(eq(ratings.toUserId, userId));

  return {
    ratings: rows,
    avgRating: Number(agg.avg).toFixed(1),
    ratingCount: Number(agg.count),
  };
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

/**
 * Create a text review from one user to another.
 *
 * @param {string} fromUserId – reviewer's UUID
 * @param {string} toUserId   – target user's UUID
 * @param {string} content    – review body text
 * @returns {Object} review row
 * @throws {AppError} 400 if reviewing yourself
 */
export async function createReview(fromUserId, toUserId, content) {
  if (fromUserId === toUserId) throw new AppError('Cannot review yourself');

  const [review] = await db
    .insert(reviews)
    .values({ fromUserId, toUserId, content })
    .returning();
  return review;
}

/**
 * Get all reviews for a user, ordered by creation date.
 *
 * @param {string} userId – target user's UUID
 * @returns {Object[]} array of review rows
 */
export async function getReviewsForUser(userId) {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.toUserId, userId))
    .orderBy(reviews.createdAt);
}
