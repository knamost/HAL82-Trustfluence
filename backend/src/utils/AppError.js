/**
 * @file AppError.js
 * @description Custom error class used throughout the application.
 *
 * Throwing `new AppError('message', 404)` from any service or
 * controller will result in the error handler sending:
 *   HTTP 404  { "error": "message" }
 *
 * Default status code is 400 (Bad Request) if not specified.
 */

export class AppError extends Error {
  /**
   * @param {string} message    — human-readable error description
   * @param {number} statusCode — HTTP status code (default 400)
   */
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}
