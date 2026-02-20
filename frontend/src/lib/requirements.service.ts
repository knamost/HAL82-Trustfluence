/**
 * Requirements API service
 */
import { apiGet, apiPost, apiPut, apiDelete } from "./api-client";

export interface Requirement {
  id: string;
  brandId: string;
  title: string;
  description: string | null;
  niches: string[];
  minFollowers: number;
  minEngagementRate: number;
  budgetMin: number | null;
  budgetMax: number | null;
  status: "open" | "closed" | "paused";
  createdAt: string;
  updatedAt: string;
}

export interface RequirementListParams {
  niche?: string;
  minFollowers?: number;
  status?: string;
  page?: number;
  limit?: number;
}

/** List requirements (public) */
export async function listRequirements(params: RequirementListParams = {}): Promise<Requirement[]> {
  const qs = new URLSearchParams();
  if (params.niche) qs.set("niche", params.niche);
  if (params.minFollowers) qs.set("minFollowers", String(params.minFollowers));
  if (params.status) qs.set("status", params.status);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiGet<Requirement[]>(`/requirements${query ? `?${query}` : ""}`);
}

/** Get single requirement */
export async function getRequirement(id: string): Promise<Requirement> {
  return apiGet<Requirement>(`/requirements/${id}`);
}

/** Create a requirement (brand only) */
export async function createRequirement(payload: {
  title: string;
  description?: string;
  niches?: string[];
  minFollowers?: number;
  minEngagementRate?: number;
  budgetMin?: number;
  budgetMax?: number;
}): Promise<Requirement> {
  return apiPost<Requirement>("/requirements", payload, true);
}

/** Update a requirement (brand owner only) */
export async function updateRequirement(
  id: string,
  payload: Partial<{
    title: string;
    description: string;
    niches: string[];
    minFollowers: number;
    minEngagementRate: number;
    budgetMin: number;
    budgetMax: number;
    status: "open" | "closed" | "paused";
  }>
): Promise<Requirement> {
  return apiPut<Requirement>(`/requirements/${id}`, payload, true);
}

/** Delete a requirement (brand owner only) */
export async function deleteRequirement(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/requirements/${id}`);
}
