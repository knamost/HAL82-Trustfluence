/**
 * @file validate.js
 * @description Express middleware that validates `req.body` against a Zod schema.
 *
 * Usage in a route:
 *   import { validate } from '../middlewares/validate.middleware.js';
 *   import { registerSchema } from '../validation/auth.validation.js';
 *
 *   router.post('/register', validate(registerSchema), authController.register);
 *
 * How it works:
 *   1. Calls `schema.parse(req.body)` — Zod strips unknown keys and coerces types.
 *   2. On success → replaces `req.body` with the clean, typed output and calls `next()`.
 *   3. On failure → forwards the ZodError to the central error handler which
 *      formats it into a user-friendly 400 response (see middlewares/errorHandler.js).
 */

export function validate(schema) {
  return (req, _res, next) => {
    try {
      // .parse() throws ZodError on validation failure
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err); // caught by errorHandler middleware
    }
  };
}
