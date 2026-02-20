/**
 * @file index.js
 * @description Application entry point — bootstraps Express, mounts
 * middlewares and routes, then starts listening.
 *
 * Request flow:
 *   Client → express.json() → route → [validate] → [authenticate] → [authorize]
 *          → controller → service → DB
 *          → errorHandler (catches all thrown / next(err) errors)
 *
 * Architecture (monolith, single process):
 *   routes/        — thin route definitions (HTTP verb + path + middleware chain)
 *   controllers/   — req/res handling (reads body, calls service, sends response)
 *   services/      — business logic & DB access via Drizzle ORM
 *   models/        — Drizzle table schemas (one file per table)
 *   validation/    — Zod schemas (one file per domain)
 *   middlewares/   — auth, validation, error handling
 *   utils/         — JWT helpers, async handler, AppError class
 */

import 'dotenv/config';
import express from 'express';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

// ── Route modules ────────────────────────────────────────────────────────────
import authRouter from './routes/auth.route.js';
import creatorsRouter from './routes/creators.route.js';
import brandsRouter from './routes/brands.route.js';
import requirementsRouter from './routes/requirements.route.js';
import feedbackRouter from './routes/feedback.route.js';
import socialRouter from './routes/social.route.js';

const app = express();
const PORT = process.env.PORT ?? 8000;

// --- Middlewares ---
app.use(express.json());

// --- Routes ---
app.get('/', (req, res) => {
  return res.json({ status: 'Trustfluence API is up and running 🚀' });
});

app.use('/auth', authRouter);
app.use('/creators', creatorsRouter);
app.use('/brands', brandsRouter);
app.use('/requirements', requirementsRouter);
app.use('/feedback', feedbackRouter);
app.use('/social', socialRouter);

// --- Error handler (must be last) ---
app.use(errorHandler);

// --- Start ---
app.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`));