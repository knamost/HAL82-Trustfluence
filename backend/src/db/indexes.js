/**
 * @file db/indexes.js
 * @description Creates PostgreSQL indexes for fast search/filter.
 *
 * Uses pg_trgm extension for trigram-based fuzzy search on text fields
 * and GIN index on JSONB niches for containment queries.
 *
 * Run once at app startup — CREATE IF NOT EXISTS ensures idempotency.
 */

import db from './index.js';
import { sql } from 'drizzle-orm';

export async function ensureIndexes() {
  try {
    // Enable pg_trgm extension for trigram search (requires superuser or CREATE extension privilege)
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    // GIN trigram index on display_name for fast ILIKE / similarity search
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_creator_display_name_trgm
      ON creator_profiles
      USING gin (display_name gin_trgm_ops)
    `);

    // GIN index on niches JSONB for fast @> (contains) queries
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_creator_niches_gin
      ON creator_profiles
      USING gin (niches)
    `);

    // B-tree index on followers_count for range queries
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_creator_followers
      ON creator_profiles (followers_count)
    `);

    // B-tree index on engagement_rate for range queries
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_creator_engagement
      ON creator_profiles (engagement_rate)
    `);

    console.log('✅ Database indexes ensured');
  } catch (err) {
    // Non-fatal — app still works without indexes, just slower
    console.warn('⚠️  Could not create indexes (non-fatal):', err.message);
  }
}
