/**
 * @file requirementService.js
 * @description Business logic for campaign requirement CRUD.
 *
 * A "requirement" is a campaign brief posted by a brand describing
 * the kind of creators they want to work with.  Brand users can
 * create, update, and delete their own requirements.  Everyone
 * can list and view requirements.
 */

import { eq, gte, sql, and } from 'drizzle-orm';
import db from '../db/index.js';
import { requirements, brandProfiles } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Create a new campaign requirement.
 *
 * @param {string} brandId – UUID of the brand user
 * @param {Object} data    – requirement fields
 * @returns {Object} the newly created requirement row
 */
export async function createRequirement(brandId, data) {
  const [req] = await db
    .insert(requirements)
    .values({ brandId, ...data })
    .returning();
  return req;
}

/**
 * List requirements with optional filters and pagination.
 *
 * @param {Object} filters
 * @param {string} [filters.niche]        – filter by niche tag
 * @param {number} [filters.minFollowers] – minimum follower threshold
 * @param {string} [filters.status]       – open | closed | paused
 * @param {number} [filters.page=1]
 * @param {number} [filters.limit=20]
 * @returns {Object[]} array of requirement rows
 */
export async function listRequirements({ niche, minFollowers, status, page = 1, limit = 20 }) {
  const conditions = [];

  if (niche) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM jsonb_array_elements_text(${requirements.niches}) AS n WHERE lower(n) = lower(${niche}))`,
    );
  }
  if (minFollowers) {
    conditions.push(gte(requirements.minFollowers, Number(minFollowers)));
  }
  if (status) {
    conditions.push(eq(requirements.status, status));
  }

  const offset = (Number(page) - 1) * Number(limit);

  let query = db
    .select({
      id: requirements.id,
      brandId: requirements.brandId,
      brandName: brandProfiles.companyName,
      title: requirements.title,
      description: requirements.description,
      niches: requirements.niches,
      minFollowers: requirements.minFollowers,
      minEngagementRate: requirements.minEngagementRate,
      budgetMin: requirements.budgetMin,
      budgetMax: requirements.budgetMax,
      status: requirements.status,
      createdAt: requirements.createdAt,
      updatedAt: requirements.updatedAt,
    })
    .from(requirements)
    .leftJoin(brandProfiles, eq(requirements.brandId, brandProfiles.userId));
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query.limit(Number(limit)).offset(offset);
}

/**
 * Get a single requirement by id.
 *
 * @param {string} id – requirement UUID
 * @returns {Object} requirement row
 * @throws {AppError} 404 if not found
 */
export async function getRequirementById(id) {
  const [req] = await db
    .select()
    .from(requirements)
    .where(eq(requirements.id, id))
    .limit(1);
  if (!req) throw new AppError('Requirement not found', 404);
  return req;
}

/**
 * Update an existing requirement (owner only).
 *
 * @param {string} id      – requirement UUID
 * @param {string} brandId – UUID of the requesting brand (for ownership check)
 * @param {Object} data    – fields to update
 * @returns {Object} updated requirement row
 * @throws {AppError} 404 if not found, 403 if not the owner
 */
export async function updateRequirement(id, brandId, data) {
  const [existing] = await db
    .select()
    .from(requirements)
    .where(eq(requirements.id, id))
    .limit(1);

  if (!existing) throw new AppError('Requirement not found', 404);
  if (existing.brandId !== brandId) throw new AppError('Forbidden', 403);

  const [updated] = await db
    .update(requirements)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(requirements.id, id))
    .returning();
  return updated;
}

/**
 * Delete a requirement (owner only).
 *
 * @param {string} id      – requirement UUID
 * @param {string} brandId – UUID of the requesting brand
 * @returns {{ message: string }}
 * @throws {AppError} 404 if not found, 403 if not the owner
 */
export async function deleteRequirement(id, brandId) {
  const [existing] = await db
    .select()
    .from(requirements)
    .where(eq(requirements.id, id))
    .limit(1);

  if (!existing) throw new AppError('Requirement not found', 404);
  if (existing.brandId !== brandId) throw new AppError('Forbidden', 403);

  await db.delete(requirements).where(eq(requirements.id, id));
  return { message: 'Deleted' };
}
