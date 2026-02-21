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
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { ensureIndexes } from './db/indexes.js';

// ── Route modules ────────────────────────────────────────────────────────────
import authRouter from './routes/auth.route.js';
import creatorsRouter from './routes/creators.route.js';
import brandsRouter from './routes/brands.route.js';
import requirementsRouter from './routes/requirements.route.js';
import feedbackRouter from './routes/feedback.route.js';
import socialRouter from './routes/social.route.js';
import adminRouter from './routes/admin.route.js';
import applicationsRouter from './routes/applications.route.js';
import messagesRouter from './routes/messages.route.js';

const app = express();
const PORT = process.env.PORT ?? 8000;

// --- Middlewares ---
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman) and any localhost port
    if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// --- Routes ---
app.get('/', (req, res) => {
  return res.json({ status: 'Trustfluence API is up and running 🚀' });
});

app.use('/api/auth', authRouter);
app.use('/api/creators', creatorsRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/requirements', requirementsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/social', socialRouter);
app.use('/api/admin', adminRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/messages', messagesRouter);

// --- Error handler (must be last) ---
app.use(errorHandler);

// --- Start ---
app.listen(PORT, async () => {
  console.log(`Server is listening on port: ${PORT}`);
  await ensureIndexes();
});