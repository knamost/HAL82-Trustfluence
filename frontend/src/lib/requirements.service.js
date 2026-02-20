/**
 * Requirements API service
 */
import { apiGet, apiPost, apiPut, apiDelete } from "./api-client";

/** List requirements (public) */
export async function listRequirements(params = {}) {
  const qs = new URLSearchParams();
  if (params.niche) qs.set("niche", params.niche);
  if (params.minFollowers) qs.set("minFollowers", String(params.minFollowers));
  if (params.status) qs.set("status", params.status);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiGet(`/requirements${query ? `?${query}` : ""}`);
}

/** Get single requirement */
export async function getRequirement(id) {
  return apiGet(`/requirements/${id}`);
}

/** Create a requirement (brand only) */
export async function createRequirement(payload) {
  return apiPost("/requirements", payload, true);
}

/** Update a requirement (brand owner only) */
export async function updateRequirement(id, payload) {
  return apiPut(`/requirements/${id}`, payload, true);
}

/** Delete a requirement (brand owner only) */
export async function deleteRequirement(id) {
  return apiDelete(`/requirements/${id}`);
}
