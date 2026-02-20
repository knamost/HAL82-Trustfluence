/**
 * @file creatorService.js
 * @description Business logic for creator profile CRUD and listing.
 *
 * Provides:
 *   • upsertCreatorProfile – create or update a creator's profile
 *   • getCreatorProfile    – fetch by user id (own profile)
 *   • listCreators         – filtered, paginated list
 *   • getCreatorById       – public view with average rating
 */

import { eq, ilike, gte, sql } from 'drizzle-orm';
import db from '../db/index.js';
import { creatorProfiles, ratings } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Create or update the creator profile for the authenticated user.
 *
 * @param {string} userId – the authenticated user's UUID
 * @param {Object} data   – profile fields (displayName, bio, niches, etc.)
 * @returns {Object} the created or updated profile row
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
 * Get a single creator profile by the owning user's id.
 *
 * @param {string} userId – UUID of the user
 * @returns {Object} profile row
 * @throws {AppError} 404 if not found
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
 * List creators with optional filters and pagination.
 *
 * Supported query params:
 *   • niche         – filter by jsonb niches array (contains)
 *   • minFollowers  – minimum follower count
 *   • minEngagement – minimum engagement rate (%)
 *   • search        – case-insensitive display name search
 *   • page / limit  – pagination (defaults: page=1, limit=20)
 *
 * @param {Object} filters – query string parameters
 * @returns {Object[]} array of creator profiles
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
 * Get a creator profile by its own id (public view).
 * Also attaches the average rating and total rating count.
 *
 * @param {string} profileId – creator_profiles.id UUID
 * @returns {Object} profile + avgRating + ratingCount
 * @throws {AppError} 404 if not found
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
