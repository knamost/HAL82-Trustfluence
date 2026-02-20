/**
 * @file review.model.js
 * @description Drizzle schema for the `reviews` table.
 *
 * Free-text reviews that any authenticated user can leave on
 * another user's profile. Unlike ratings there is no uniqueness
 * constraint — a user can leave multiple reviews over time.
 */

import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './user.model.js';

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),

  /** The user writing the review */
  fromUserId: uuid('from_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  /** The user being reviewed */
  toUserId: uuid('to_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  /** Review body text */
  content: text('content').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
