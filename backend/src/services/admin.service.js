/**
 * @file admin.service.js
 * @description Business logic for admin-only operations.
 *
 * Provides:
 *   • getDashboardStats – platform-wide counts
 *   • listUsers         – paginated user list with optional role filter
 *   • updateUserRole    – change a user's role
 *   • deleteUser        – remove a user account
 */

import { eq, sql, ilike, and } from 'drizzle-orm';
import db from '../db/index.js';
import { users, creatorProfiles, brandProfiles, requirements, ratings, reviews } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Get platform-wide stats for the admin dashboard.
 */
export async function getDashboardStats() {
  const [[userCount], [creatorCount], [brandCount], [requirementCount], [ratingCount], [reviewCount]] =
    await Promise.all([
      db.select({ count: sql`COUNT(*)::int` }).from(users),
      db.select({ count: sql`COUNT(*)::int` }).from(creatorProfiles),
      db.select({ count: sql`COUNT(*)::int` }).from(brandProfiles),
      db.select({ count: sql`COUNT(*)::int` }).from(requirements),
      db.select({ count: sql`COUNT(*)::int` }).from(ratings),
      db.select({ count: sql`COUNT(*)::int` }).from(reviews),
    ]);

  return {
    totalUsers: userCount.count,
    totalCreators: creatorCount.count,
    totalBrands: brandCount.count,
    totalRequirements: requirementCount.count,
    totalRatings: ratingCount.count,
    totalReviews: reviewCount.count,
  };
}

/**
 * List all users with optional filters and pagination.
 *
 * @param {Object} filters – { role, search, page, limit }
 */
export async function listUsers({ role, search, page = 1, limit = 20 }) {
  const conditions = [];

  if (role) {
    conditions.push(eq(users.role, role));
  }

  if (search) {
    conditions.push(
      sql`(${ilike(users.email, `%${search}%`)} OR ${ilike(users.firstName, `%${search}%`)} OR ${ilike(users.lastName, `%${search}%`)})`
    );
  }

  const offset = (Number(page) - 1) * Number(limit);

  let query = db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users);

  for (const cond of conditions) {
    query = query.where(cond);
  }

  const results = await query.orderBy(users.createdAt).limit(Number(limit)).offset(offset);

  // Get total count for pagination
  let countQuery = db.select({ count: sql`COUNT(*)::int` }).from(users);
  for (const cond of conditions) {
    countQuery = countQuery.where(cond);
  }
  const [{ count: total }] = await countQuery;

  return { users: results, total, page: Number(page), limit: Number(limit) };
}

/**
 * Delete a user by ID.
 */
export async function deleteUser(userId) {
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new AppError('User not found', 404);

  await db.delete(users).where(eq(users.id, userId));
  return { message: 'User deleted successfully' };
}
