/**
 * @file requirement.model.js
 * @description Drizzle schema for the `requirements` table.
 *
 * A "requirement" is a campaign brief posted by a brand.
 * It describes what kind of creators the brand is looking for,
 * including niche tags, minimum follower / engagement thresholds,
 * and an optional budget range.
 */

import { pgTable, uuid, varchar, text, timestamp, integer, real, jsonb } from 'drizzle-orm/pg-core';
import { users } from './user.model.js';
import { requirementStatusEnum } from './enums.js';

export const requirements = pgTable('requirements', {
  id: uuid('id').primaryKey().defaultRandom(),

  /** FK → users.id of the brand that posted this requirement */
  brandId: uuid('brand_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  /** Short title, e.g. "Looking for beauty creators 10k+" */
  title: varchar('title', { length: 300 }).notNull(),

  /** Detailed description of the campaign */
  description: text('description'),

  /** Desired creator niches, e.g. ["beauty", "lifestyle"] */
  niches: jsonb('niches').default([]),

  /** Minimum followers a creator must have */
  minFollowers: integer('min_followers').default(0),

  /** Minimum engagement rate (%) a creator must have */
  minEngagementRate: real('min_engagement_rate').default(0),

  /** Budget range in USD (optional) */
  budgetMin: integer('budget_min'),
  budgetMax: integer('budget_max'),

  /** open | closed | paused */
  status: requirementStatusEnum('status').default('open').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
