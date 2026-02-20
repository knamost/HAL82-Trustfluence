/**
 * Admin API service — admin-only operations
 */
import { apiGet, apiDelete } from "./api-client";

export interface AdminStats {
  totalUsers: number;
  totalCreators: number;
  totalBrands: number;
  totalRequirements: number;
  totalRatings: number;
  totalReviews: number;
}

export interface AdminUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: "creator" | "brand" | "admin";
  createdAt: string;
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

/** Get dashboard stats */
export async function getAdminStats(): Promise<AdminStats> {
  return apiGet<AdminStats>("/admin/stats", true);
}

/** List all users */
export async function listUsers(params: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<UserListResponse> {
  const qs = new URLSearchParams();
  if (params.role) qs.set("role", params.role);
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiGet<UserListResponse>(`/admin/users${query ? `?${query}` : ""}`, true);
}

/** Delete a user */
export async function deleteUser(userId: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/admin/users/${userId}`);
}
