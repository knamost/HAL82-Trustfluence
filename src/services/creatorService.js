import { eq, ilike, gte, sql } from 'drizzle-orm';
import db from '../db/index.js';
import { creatorProfiles, users, ratings } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Create or update the creator profile for the authenticated user.
 */
export async function upsertCreatorProfile(userId, data) {
  // Check if profile exists
  const [existing] = await db
    .select({ id: creatorProfiles.id })
    .from(creatorProfiles)
    .where(eq(creatorProfiles.userId, userId))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(creatorProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(creatorProfiles.userId, userId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(creatorProfiles)
    .values({ userId, ...data })
    .returning();
  return created;
}

/**
 * Get a single creator profile by user id.
 */
export async function getCreatorProfile(userId) {
  const [profile] = await db
    .select()
    .from(creatorProfiles)
    .where(eq(creatorProfiles.userId, userId))
    .limit(1);

  if (!profile) throw new AppError('Creator profile not found', 404);
  return profile;
}

/**
 * List creators with optional filters: niche, minFollowers, minEngagement, search (display name).
 */
export async function listCreators({ niche, minFollowers, minEngagement, search, page = 1, limit = 20 }) {
  const conditions = [];

  if (niche) {
    // jsonb array contains value
    conditions.push(sql`${creatorProfiles.niches} @> ${JSON.stringify([niche])}::jsonb`);
  }

  if (minFollowers) {
    conditions.push(gte(creatorProfiles.followersCount, Number(minFollowers)));
  }

  if (minEngagement) {
    conditions.push(gte(creatorProfiles.engagementRate, Number(minEngagement)));
  }

  if (search) {
    conditions.push(ilike(creatorProfiles.displayName, `%${search}%`));
  }

  const offset = (Number(page) - 1) * Number(limit);

  let query = db.select().from(creatorProfiles);

  for (const cond of conditions) {
    query = query.where(cond);
  }

  const results = await query.limit(Number(limit)).offset(offset);
  return results;
}

/**
 * Get a creator profile by profile id (public view).
 */
export async function getCreatorById(profileId) {
  const [profile] = await db
    .select()
    .from(creatorProfiles)
    .where(eq(creatorProfiles.id, profileId))
    .limit(1);

  if (!profile) throw new AppError('Creator not found', 404);

  // Attach average rating
  const [ratingAgg] = await db
    .select({
      avg: sql`COALESCE(AVG(${ratings.score}), 0)`,
      count: sql`COUNT(${ratings.id})`,
    })
    .from(ratings)
    .where(eq(ratings.toUserId, profile.userId));

  return { ...profile, avgRating: Number(ratingAgg.avg).toFixed(1), ratingCount: Number(ratingAgg.count) };
}
