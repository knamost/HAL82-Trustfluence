/**
 * @file db/index.js
 * @description Initialises the Drizzle ORM database connection.
 *
 * Uses the `DATABASE_URL` environment variable to connect to PostgreSQL.
 * The exported `db` instance is a singleton — import it anywhere you
 * need to run queries:
 *
 *   import db from '../db/index.js';
 *   const rows = await db.select().from(users);
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

/** Drizzle ORM database instance (PostgreSQL) */
export const db = drizzle(process.env.DATABASE_URL);
export default db;