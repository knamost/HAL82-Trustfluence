import { eq, ilike, gte, sql } from 'drizzle-orm';
import db from '../db/index.js';
import { brandProfiles, ratings } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Create or update the brand profile for the authenticated user.
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
 * Get a single brand profile by user id.
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
 * List brands with optional filters: category, minRating, search (company name).
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
 * Get a brand profile by profile id (public view).
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
