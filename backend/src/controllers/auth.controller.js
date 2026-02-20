/**
 * @file auth.controller.js
 * @description Handles HTTP request / response for authentication.
 *
 * Flow:  Route → (validate middleware) → Controller → Service → DB
 *
 * The controller never touches the database directly — all data access
 * is delegated to authService.  It only:
 *   1. Reads the (already validated) req.body / req.user
 *   2. Calls the appropriate service function
 *   3. Sends the JSON response with the correct status code
 */

import * as authService from '../services/auth.service.js';

/** POST /auth/register — create a new user account */
export async function register(req, res) {
  const result = await authService.registerUser(req.body);
  res.status(201).json(result);
}

/** POST /auth/login — authenticate and receive a JWT */
export async function login(req, res) {
  const result = await authService.loginUser(req.body);
  res.json(result);
}

/** GET /auth/me — return the currently authenticated user's info */
export async function me(req, res) {
  const user = await authService.getMe(req.user.id);
  res.json(user);
}
