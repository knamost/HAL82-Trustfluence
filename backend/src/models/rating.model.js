/**
 * @file rating.model.js
 * @description Drizzle schema for the `ratings` table.
 *
 * Any logged-in user can rate another user (1–5 stars).
 * A unique index on (from_user_id, to_user_id) ensures each user
 * can only leave one rating per target — subsequent ratings update
 * the existing row (upsert logic in the service layer).
 */

import { pgTable, uuid, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './user.model.js';

export const ratings = pgTable(
  'ratings',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    /** The user giving the rating */
    fromUserId: uuid('from_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    /** The user being rated */
    toUserId: uuid('to_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    /** Rating score: integer 1–5 */
    score: integer('score').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    /** Each user can only rate a given target once */
    uniqueIndex('unique_rating').on(table.fromUserId, table.toUserId),
  ]
);
