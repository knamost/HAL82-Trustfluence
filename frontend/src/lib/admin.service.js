/**
 * Admin API service — admin-only operations
 */
import { apiGet, apiDelete } from "./api-client";

/** Get dashboard stats */
export async function getAdminStats() {
  return apiGet("/admin/stats", true);
}

/** List all users */
export async function listUsers(params = {}) {
  const qs = new URLSearchParams();
  if (params.role) qs.set("role", params.role);
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiGet(`/admin/users${query ? `?${query}` : ""}`, true);
}

/** Delete a user */
export async function deleteUser(userId) {
  return apiDelete(`/admin/users/${userId}`);
}
