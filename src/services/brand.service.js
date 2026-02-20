/**
 * @file brandService.js
 * @description Business logic for brand profile CRUD and listing.
 *
 * Provides:
 *   • upsertBrandProfile – create or update a brand's profile
 *   • getBrandProfile    – fetch by user id (own profile)
 *   • listBrands         – filtered, paginated list
 *   • getBrandById       – public view with average rating
 */

import { eq, ilike, sql } from 'drizzle-orm';
import db from '../db/index.js';
import { brandProfiles, ratings } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Create or update the brand profile for the authenticated user.
 *
 * @param {string} userId – the authenticated user's UUID
 * @param {Object} data   – profile fields (companyName, bio, category, etc.)
 * @returns {Object} the created or updated profile row
 */
export async function upsertBrandProfile(userId, data) {
  const [existing] = await db
    .select({ id: brandProfiles.id })
    .from(brandProfiles)
    .where(eq(brandProfiles.userId, userId))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(brandProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(brandProfiles.userId, userId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(brandProfiles)
    .values({ userId, ...data })
    .returning();
  return created;
}

/**
 * Get a single brand profile by the owning user's id.
 *
 * @param {string} userId – UUID of the user
 * @returns {Object} profile row
 * @throws {AppError} 404 if not found
 */
export async function getBrandProfile(userId) {
  const [profile] = await db
    .select()
    .from(brandProfiles)
    .where(eq(brandProfiles.userId, userId))
    .limit(1);

  if (!profile) throw new AppError('Brand profile not found', 404);
  return profile;
}

/**
 * List brands with optional filters and pagination.
 *
 * Supported query params:
 *   • category  – case-insensitive category match
 *   • minRating – minimum average rating (post-filter)
 *   • search    – case-insensitive company name search
 *   • page / limit – pagination (defaults: page=1, limit=20)
 *
 * @param {Object} filters – query string parameters
 * @returns {Object[]} array of brand profiles
 */
export async function listBrands({ category, minRating, search, page = 1, limit = 20 }) {
  const conditions = [];

  if (category) {
    conditions.push(ilike(brandProfiles.category, `%${category}%`));
  }

  if (search) {
    conditions.push(ilike(brandProfiles.companyName, `%${search}%`));
  }

  const offset = (Number(page) - 1) * Number(limit);

  let query = db.select().from(brandProfiles);

  for (const cond of conditions) {
    query = query.where(cond);
  }

  let results = await query.limit(Number(limit)).offset(offset);

  // If minRating filter, we need to post-filter (small scale is fine)
  if (minRating) {
    const enriched = await Promise.all(
      results.map(async (brand) => {
        const [agg] = await db
          .select({ avg: sql`COALESCE(AVG(${ratings.score}), 0)` })
          .from(ratings)
          .where(eq(ratings.toUserId, brand.userId));
        return { ...brand, avgRating: Number(agg.avg) };
      })
    );
    results = enriched.filter((b) => b.avgRating >= Number(minRating));
  }

  return results;
}

/**
 * Get a brand profile by its own id (public view).
 * Also attaches the average rating and total rating count.
 *
 * @param {string} profileId – brand_profiles.id UUID
 * @returns {Object} profile + avgRating + ratingCount
 * @throws {AppError} 404 if not found
 */
export async function getBrandById(profileId) {
  const [profile] = await db
    .select()
    .from(brandProfiles)
    .where(eq(brandProfiles.id, profileId))
    .limit(1);

  if (!profile) throw new AppError('Brand not found', 404);

  const [ratingAgg] = await db
    .select({
      avg: sql`COALESCE(AVG(${ratings.score}), 0)`,
      count: sql`COUNT(${ratings.id})`,
    })
    .from(ratings)
    .where(eq(ratings.toUserId, profile.userId));

  return { ...profile, avgRating: Number(ratingAgg.avg).toFixed(1), ratingCount: Number(ratingAgg.count) };
}
