/**
 * @file asyncHandler.js
 * @description Wraps an async Express route handler so that any
 * rejected promise is automatically forwarded to the next()
 * error handler instead of crashing the process.
 *
 * Usage:
 *   import { asyncHandler } from '../utils/asyncHandler.js';
 *   router.get('/foo', asyncHandler(async (req, res) => { ... }));
 */

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
