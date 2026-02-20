/**
 * @file creatorProfile.model.js
 * @description Drizzle schema for the `creator_profiles` table.
 *
 * Each creator has at most one profile linked to their user account.
 * Stores public info (display name, bio, avatar), social-media metrics
 * (platform, handle, followers, engagement), and categorisation data
 * (niches, promotion types) used for filtering and matching.
 *
 * Social metrics can be updated manually or via the /social API which
 * fetches data from third-party platforms.
 */

import { pgTable, uuid, varchar, text, timestamp, integer, real, jsonb } from 'drizzle-orm/pg-core';
import { users } from './user.model.js';

export const creatorProfiles = pgTable('creator_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),

  /** FK → users.id  (one-to-one, cascade delete) */
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),

  /** Public display name shown on the platform */
  displayName: varchar('display_name', { length: 150 }).notNull(),

  /** Short bio / description */
  bio: text('bio'),

  /** URL to the creator's avatar image */
  avatarUrl: varchar('avatar_url', { length: 500 }),

  // ── Social Media Metrics ──────────────────────────────────────
  /** e.g. "instagram", "tiktok", "youtube" */
  platform: varchar('platform', { length: 50 }),

  /** The creator's handle on that platform (e.g. "@alicebeauty") */
  socialHandle: varchar('social_handle', { length: 255 }),

  /** Total followers (updated periodically) */
  followersCount: integer('followers_count').default(0),

  /** Engagement rate as a percentage 0–100 */
  engagementRate: real('engagement_rate').default(0),

  // ── Categorisation ────────────────────────────────────────────
  /** JSON array of niche tags, e.g. ["beauty", "tech", "fitness"] */
  niches: jsonb('niches').default([]),

  /** JSON array of content formats, e.g. ["reels", "stories", "posts"] */
  promotionTypes: jsonb('promotion_types').default([]),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
