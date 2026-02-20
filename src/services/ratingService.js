import { eq, and, sql } from 'drizzle-orm';
import db from '../db/index.js';
import { ratings, reviews } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

// ─── Ratings ─────────────────────────────────────────────────────────────────

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

export async function createReview(fromUserId, toUserId, content) {
  if (fromUserId === toUserId) throw new AppError('Cannot review yourself');

  const [review] = await db
    .insert(reviews)
    .values({ fromUserId, toUserId, content })
    .returning();
  return review;
}

export async function getReviewsForUser(userId) {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.toUserId, userId))
    .orderBy(reviews.createdAt);
}
