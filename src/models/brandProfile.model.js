/**
 * @file brandProfile.model.js
 * @description Drizzle schema for the `brand_profiles` table.
 *
 * Each brand user has at most one profile. Stores public company info
 * (name, bio, logo, website) and a category tag used for filtering.
 */

import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './user.model.js';

export const brandProfiles = pgTable('brand_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),

  /** FK → users.id  (one-to-one, cascade delete) */
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),

  /** Official company / brand name */
  companyName: varchar('company_name', { length: 255 }).notNull(),

  /** Short brand description */
  bio: text('bio'),

  /** URL to the brand's logo */
  logoUrl: varchar('logo_url', { length: 500 }),

  /** Brand website */
  website: varchar('website', { length: 500 }),

  /** Industry / category, e.g. "fashion", "tech", "beauty" */
  category: varchar('category', { length: 100 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
