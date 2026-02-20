/**
 * @file errorHandler.js
 * @description Central error-handling middleware.
 *
 * Catches every error forwarded via `next(err)` and sends a
 * consistent JSON response: `{ error: "..." }`.
 *
 * Recognised error types:
 *   • AppError — custom class with a `statusCode` property
 *   • ZodError — thrown by the validate() middleware when the
 *     request body doesn't match the Zod schema
 *   • Everything else → generic 500
 *
 * In development mode the full error is logged to the console.
 */

import { z } from 'zod/v4';

export function errorHandler(err, req, res, _next) {
  // ── Zod validation errors → 400 with human-readable messages ──
  if (err instanceof z.ZodError) {
    const messages = z.prettifyError(err);
    if (process.env.NODE_ENV !== 'production') console.error(err);
    return res.status(400).json({ error: messages });
  }

  // ── App / generic errors ──
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({ error: message });
}
