/**
 * @file application.service.js
 * @description Business logic for campaign applications.
 *
 * A creator applies to a brand's campaign requirement. The service
 * enforces one-application-per-creator-per-requirement, ownership
 * checks, and status transition rules.
 */

import { eq, and, desc } from 'drizzle-orm';
import db from '../db/index.js';
import { applications, requirements, users, brandProfiles, creatorProfiles } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Submit a new application to a requirement.
 *
 * @param {string} creatorId      – UUID of the creator
 * @param {string} requirementId  – UUID of the requirement
 * @param {Object} data           – { coverLetter, proposedRate }
 * @returns {Object} the newly created application row
 */
export async function createApplication(creatorId, requirementId, data) {
  // Ensure requirement exists and is open
  const [req] = await db
    .select()
    .from(requirements)
    .where(eq(requirements.id, requirementId))
    .limit(1);

  if (!req) throw new AppError('Requirement not found', 404);
  if (req.status !== 'open') throw new AppError('This campaign is not currently accepting applications', 400);

  // Check for duplicate application
  const [existing] = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.creatorId, creatorId),
        eq(applications.requirementId, requirementId),
      ),
    )
    .limit(1);

  if (existing) throw new AppError('You have already applied to this campaign', 409);

  const [app] = await db
    .insert(applications)
    .values({
      creatorId,
      requirementId,
      coverLetter: data.coverLetter || null,
      proposedRate: data.proposedRate || null,
    })
    .returning();

  return app;
}

/**
 * List all applications by the current creator.
 *
 * @param {string} creatorId – UUID of the creator
 * @returns {Object[]} applications with joined requirement info
 */
export async function listMyApplications(creatorId) {
  const rows = await db
    .select({
      id: applications.id,
      requirementId: applications.requirementId,
      coverLetter: applications.coverLetter,
      proposedRate: applications.proposedRate,
      status: applications.status,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
      // Joined requirement fields
      requirementTitle: requirements.title,
      requirementDescription: requirements.description,
      requirementNiches: requirements.niches,
      requirementBudgetMin: requirements.budgetMin,
      requirementBudgetMax: requirements.budgetMax,
      requirementStatus: requirements.status,
      brandId: requirements.brandId,
      brandName: brandProfiles.companyName,
    })
    .from(applications)
    .innerJoin(requirements, eq(applications.requirementId, requirements.id))
    .leftJoin(brandProfiles, eq(requirements.brandId, brandProfiles.userId))
    .where(eq(applications.creatorId, creatorId))
    .orderBy(desc(applications.createdAt));

  return rows;
}

/**
 * List all applications for a specific requirement (brand owner only).
 *
 * @param {string} requirementId – UUID of the requirement
 * @param {string} brandId       – UUID of the brand (ownership check)
 * @returns {Object[]} applications with joined creator info
 */
export async function listApplicationsForRequirement(requirementId, brandId) {
  // Ownership check
  const [req] = await db
    .select()
    .from(requirements)
    .where(eq(requirements.id, requirementId))
    .limit(1);

  if (!req) throw new AppError('Requirement not found', 404);
  if (req.brandId !== brandId) throw new AppError('Forbidden', 403);

  const rows = await db
    .select({
      id: applications.id,
      creatorId: applications.creatorId,
      coverLetter: applications.coverLetter,
      proposedRate: applications.proposedRate,
      status: applications.status,
      createdAt: applications.createdAt,
      creatorFirstName: users.firstName,
      creatorLastName: users.lastName,
      creatorEmail: users.email,
      creatorProfileId: creatorProfiles.id,
      creatorDisplayName: creatorProfiles.displayName,
    })
    .from(applications)
    .innerJoin(users, eq(applications.creatorId, users.id))
    .leftJoin(creatorProfiles, eq(applications.creatorId, creatorProfiles.userId))
    .where(eq(applications.requirementId, requirementId))
    .orderBy(desc(applications.createdAt));

  return rows;
}

/**
 * Update application status (brand owner: accept/reject, creator: withdraw).
 *
 * @param {string} applicationId – UUID of the application
 * @param {string} userId        – UUID of the user making the change
 * @param {string} userRole      – 'creator' | 'brand'
 * @param {string} newStatus     – 'accepted' | 'rejected' | 'withdrawn'
 * @returns {Object} updated application row
 */
export async function updateApplicationStatus(applicationId, userId, userRole, newStatus) {
  const [app] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);

  if (!app) throw new AppError('Application not found', 404);

  // Creator can only withdraw their own applications
  if (userRole === 'creator') {
    if (app.creatorId !== userId) throw new AppError('Forbidden', 403);
    if (newStatus !== 'withdrawn') throw new AppError('Creators can only withdraw applications', 400);
    if (app.status !== 'pending') throw new AppError('Can only withdraw pending applications', 400);
  }

  // Brand can accept/reject applications on their requirements
  if (userRole === 'brand') {
    const [req] = await db
      .select()
      .from(requirements)
      .where(eq(requirements.id, app.requirementId))
      .limit(1);

    if (!req || req.brandId !== userId) throw new AppError('Forbidden', 403);
    if (!['accepted', 'rejected'].includes(newStatus)) {
      throw new AppError('Brands can only accept or reject applications', 400);
    }
    if (app.status !== 'pending') {
      throw new AppError('Can only update pending applications', 400);
    }
  }

  const [updated] = await db
    .update(applications)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(applications.id, applicationId))
    .returning();

  return updated;
}

/**
 * List distinct accepted partners for the current user.
 * For creators: returns brands whose campaigns they've been accepted to.
 * For brands: returns creators who have been accepted to their campaigns.
 *
 * @param {string} userId – UUID of the current user
 * @param {string} role   – 'creator' | 'brand'
 * @returns {Object[]} partner list with userId, name, profileId
 */
export async function listAcceptedPartners(userId, role) {
  if (role === 'creator') {
    // Find brands that accepted this creator's applications
    const rows = await db
      .select({
        userId: requirements.brandId,
        name: brandProfiles.companyName,
      })
      .from(applications)
      .innerJoin(requirements, eq(applications.requirementId, requirements.id))
      .leftJoin(brandProfiles, eq(requirements.brandId, brandProfiles.userId))
      .where(
        and(
          eq(applications.creatorId, userId),
          eq(applications.status, 'accepted'),
        ),
      )
      .orderBy(brandProfiles.companyName);

    // Deduplicate by userId
    const seen = new Set();
    return rows.filter((r) => {
      if (seen.has(r.userId)) return false;
      seen.add(r.userId);
      return true;
    }).map((r) => ({ userId: r.userId, name: r.name || r.userId }));
  }

  // Brand: find creators accepted to their campaigns
  const rows = await db
    .select({
      userId: applications.creatorId,
      name: creatorProfiles.displayName,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(applications)
    .innerJoin(requirements, eq(applications.requirementId, requirements.id))
    .innerJoin(users, eq(applications.creatorId, users.id))
    .leftJoin(creatorProfiles, eq(applications.creatorId, creatorProfiles.userId))
    .where(
      and(
        eq(requirements.brandId, userId),
        eq(applications.status, 'accepted'),
      ),
    )
    .orderBy(creatorProfiles.displayName);

  const seen = new Set();
  return rows.filter((r) => {
    if (seen.has(r.userId)) return false;
    seen.add(r.userId);
    return true;
  }).map((r) => ({
    userId: r.userId,
    name: r.name || [r.firstName, r.lastName].filter(Boolean).join(' ') || r.userId,
  }));
}

/**
 * Get a single application by id.
 *
 * @param {string} id – application UUID
 * @returns {Object} application row with requirement details
 */
export async function getApplicationById(id) {
  const [app] = await db
    .select({
      id: applications.id,
      requirementId: applications.requirementId,
      creatorId: applications.creatorId,
      coverLetter: applications.coverLetter,
      proposedRate: applications.proposedRate,
      status: applications.status,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
      requirementTitle: requirements.title,
      requirementDescription: requirements.description,
      requirementNiches: requirements.niches,
      requirementBudgetMin: requirements.budgetMin,
      requirementBudgetMax: requirements.budgetMax,
      brandId: requirements.brandId,
    })
    .from(applications)
    .innerJoin(requirements, eq(applications.requirementId, requirements.id))
    .where(eq(applications.id, id))
    .limit(1);

  if (!app) throw new AppError('Application not found', 404);
  return app;
}
