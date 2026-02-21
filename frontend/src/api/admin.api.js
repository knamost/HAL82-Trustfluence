import { apiGet, apiDelete } from "./index";

/**
 * GET /api/stats — public platform stats (no auth required)
 */
export async function getPublicStats() {
  return apiGet("/api/stats");
}

/**
 * GET /admin/stats — platform dashboard metrics (admin only)
 */
export async function getAdminStats() {
  return apiGet("/api/admin/stats");
}

/**
 * GET /admin/users — list / search users (admin only)
 * @param {Object} params — { role, search, page, limit }
 */
export async function listUsers(params) {
  return apiGet("/api/admin/users", params);
}

/**
 * DELETE /admin/users/:id — delete a user (admin only)
 */
export async function deleteUser(id) {
  return apiDelete(`/api/admin/users/${id}`);
}
