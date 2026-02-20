/**
 * Creators API service
 */
import { apiGet, apiPut } from "./api-client";

/** List / search creators (public) */
export async function listCreators(params = {}) {
  const qs = new URLSearchParams();
  if (params.niche) qs.set("niche", params.niche);
  if (params.minFollowers) qs.set("minFollowers", String(params.minFollowers));
  if (params.minEngagement) qs.set("minEngagement", String(params.minEngagement));
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiGet(`/creators${query ? `?${query}` : ""}`);
}

/** Get single creator profile (public) */
export async function getCreator(id) {
  return apiGet(`/creators/${id}`);
}

/** Get own creator profile (auth) */
export async function getMyCreatorProfile() {
  return apiGet("/creators/profile", true);
}

/** Upsert own creator profile (auth) */
export async function upsertCreatorProfile(payload) {
  return apiPut("/creators/profile", payload, true);
}
