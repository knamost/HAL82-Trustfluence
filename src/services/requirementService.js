import { eq, gte, sql } from 'drizzle-orm';
import db from '../db/index.js';
import { requirements } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export async function createRequirement(brandId, data) {
  const [req] = await db
    .insert(requirements)
    .values({ brandId, ...data })
    .returning();
  return req;
}

export async function listRequirements({ niche, minFollowers, status, page = 1, limit = 20 }) {
  const conditions = [];

  if (niche) {
    conditions.push(sql`${requirements.niches} @> ${JSON.stringify([niche])}::jsonb`);
  }
  if (minFollowers) {
    conditions.push(gte(requirements.minFollowers, Number(minFollowers)));
  }
  if (status) {
    conditions.push(eq(requirements.status, status));
  }

  const offset = (Number(page) - 1) * Number(limit);

  let query = db.select().from(requirements);
  for (const cond of conditions) {
    query = query.where(cond);
  }

  return query.limit(Number(limit)).offset(offset);
}

export async function getRequirementById(id) {
  const [req] = await db
    .select()
    .from(requirements)
    .where(eq(requirements.id, id))
    .limit(1);
  if (!req) throw new AppError('Requirement not found', 404);
  return req;
}

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
