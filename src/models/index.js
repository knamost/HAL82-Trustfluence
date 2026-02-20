import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  real,
  pgEnum,
  jsonb,
  boolean,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['creator', 'brand']);

export const requirementStatusEnum = pgEnum('requirement_status', [
  'open',
  'closed',
  'paused',
]);

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Creator Profiles ────────────────────────────────────────────────────────

export const creatorProfiles = pgTable('creator_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  displayName: varchar('display_name', { length: 150 }).notNull(),
  bio: text('bio'),
  avatarUrl: varchar('avatar_url', { length: 500 }),

  // Social metrics (fetched / updated via third-party APIs)
  platform: varchar('platform', { length: 50 }), // e.g. instagram, tiktok, youtube
  socialHandle: varchar('social_handle', { length: 255 }),
  followersCount: integer('followers_count').default(0),
  engagementRate: real('engagement_rate').default(0), // percentage 0-100

  // Categorisation
  niches: jsonb('niches').default([]),               // e.g. ["beauty","tech"]
  promotionTypes: jsonb('promotion_types').default([]), // e.g. ["reels","stories","posts"]

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Brand Profiles ──────────────────────────────────────────────────────────

export const brandProfiles = pgTable('brand_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  bio: text('bio'),
  logoUrl: varchar('logo_url', { length: 500 }),
  website: varchar('website', { length: 500 }),
  category: varchar('category', { length: 100 }), // e.g. "fashion", "tech"

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Requirements (Brand Posts) ──────────────────────────────────────────────

export const requirements = pgTable('requirements', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 300 }).notNull(),
  description: text('description'),
  niches: jsonb('niches').default([]),
  minFollowers: integer('min_followers').default(0),
  minEngagementRate: real('min_engagement_rate').default(0),
  budgetMin: integer('budget_min'),
  budgetMax: integer('budget_max'),
  status: requirementStatusEnum('status').default('open').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Ratings ─────────────────────────────────────────────────────────────────

export const ratings = pgTable(
  'ratings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fromUserId: uuid('from_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    toUserId: uuid('to_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    score: integer('score').notNull(), // 1-5
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('unique_rating').on(table.fromUserId, table.toUserId),
  ]
);

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromUserId: uuid('from_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  toUserId: uuid('to_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
